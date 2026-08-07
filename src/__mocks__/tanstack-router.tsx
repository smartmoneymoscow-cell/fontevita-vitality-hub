import React, { useEffect, useContext, createContext } from "react";
import {
  Link as RRDLink,
  useLocation,
  useParams,
  useNavigate,
  useSearchParams,
  Outlet as RRDOutlet,
} from "react-router-dom";

/* ---------- route registry ---------- */
const routeConfigs: Record<
  string,
  { component?: React.FC; loader?: (ctx: any) => any; head?: (ctx: any) => any }
> = {};

/* ---------- loader context ---------- */
const LoaderCtx = createContext<any>(undefined);
function useLoaderData() { return useContext(LoaderCtx); }

/* ---------- helpers ---------- */
function normalisePath(p: string) {
  return p === "/" ? "/" : p.replace(/\/+$/, "");
}

function matchRoute(pathname: string) {
  const clean = normalisePath(pathname);
  if (routeConfigs[clean]) return { key: clean, params: {} as Record<string, string> };
  const keys = Object.keys(routeConfigs).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const parts = key.split("/");
    const pathParts = clean.split("/");
    if (parts.length !== pathParts.length) continue;
    const params: Record<string, string> = {};
    let match = true;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith("$")) {
        params[parts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (parts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }
    if (match) return { key, params };
  }
  return null;
}

/* ---------- exported mocks ---------- */
export function createFileRoute(path: string) {
  return (config: any) => {
    routeConfigs[normalisePath(path)] = config;
    return { ...config, useLoaderData };
  };
}

export function createRootRouteWithContext() {
  return () => ({});
}

export function notFound() {
  throw new Error("Not found");
}

export function Link({ to, params, hash, children, ...rest }: any) {
  let href = to || "/";
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      href = href.replace(`$${k}`, String(v));
    }
  }
  if (hash) href += `#${hash}`;
  return (
    <RRDLink to={href} {...rest}>
      {children}
    </RRDLink>
  );
}

export const Outlet = RRDOutlet;
export const HeadContent = () => null;
export const Scripts = () => null;
export { useParams, useNavigate, useSearchParams, useLocation };

/* ---------- router component for App.tsx ---------- */
export function MockRouter() {
  const { pathname } = useLocation();
  const result = matchRoute(pathname);
  const [loaderData, setLoaderData] = React.useState<any>(undefined);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setReady(false);
    if (!result) return;
    const cfg = routeConfigs[result.key];
    if (cfg?.loader) {
      try {
        const r = cfg.loader({ params: result.params });
        if (r && typeof r.then === "function") {
          r.then((data: any) => { if (!cancelled) { setLoaderData(data); setReady(true); } }).catch(() => { if (!cancelled) setReady(true); });
        } else {
          if (!cancelled) { setLoaderData(r); setReady(true); }
        }
      } catch { if (!cancelled) setReady(true); }
    } else {
      if (!cancelled) { setLoaderData(undefined); setReady(true); }
    }
    return () => { cancelled = true; };
  }, [pathname]);

  React.useEffect(() => {
    if (!result || !ready) return;
    const cfg = routeConfigs[result.key];
    if (cfg?.head) {
      try {
        const h = cfg.head({ loaderData });
        if (h?.meta) {
          for (const m of h.meta) {
            let el = document.querySelector(
              m.name
                ? `meta[name="${m.name}"]`
                : `meta[property="${m.property}"]`
            );
            if (!el) {
              el = document.createElement("meta");
              if (m.name) el.setAttribute("name", m.name);
              if (m.property) el.setAttribute("property", m.property);
              document.head.appendChild(el);
            }
            el.setAttribute("content", m.content);
          }
        }
        if (h?.links) {
          for (const l of h.links) {
            if (l.rel === "canonical") {
              let link = document.querySelector('link[rel="canonical"]');
              if (!link) {
                link = document.createElement("link");
                link.setAttribute("rel", "canonical");
                document.head.appendChild(link);
              }
              link.setAttribute("href", l.href);
            }
          }
        }
        if (h?.scripts) {
          for (const s of h.scripts) {
            const script = document.createElement("script");
            script.type = "application/ld+json";
            script.textContent = s.children;
            document.head.appendChild(script);
          }
        }
      } catch {}
    }
  }, [pathname, ready, loaderData]);

  if (!result) return <p style={{ padding: 40 }}>Страница не найдена</p>;

  const cfg = routeConfigs[result.key];
  if (!cfg?.component) return null;

  if (cfg.loader && !ready) return null;

  const Component = cfg.component;
  return (
    <LoaderCtx.Provider value={loaderData}>
      <Component />
    </LoaderCtx.Provider>
  );
}
