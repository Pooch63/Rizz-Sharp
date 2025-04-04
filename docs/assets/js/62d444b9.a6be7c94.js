"use strict";
(self.webpackChunkdocumentation = self.webpackChunkdocumentation || []).push([
  [208],
  {
    3054: (e, r, t) => {
      t.r(r),
        t.d(r, {
          assets: () => i,
          contentTitle: () => c,
          default: () => p,
          frontMatter: () => a,
          metadata: () => n,
          toc: () => d,
        });
      const n = JSON.parse(
        '{"id":"performance","title":"Unparalleled Performance","description":"Rizzlers need to spend their time on scalable, feature-rich code. Let Rizz#","source":"@site/docs/performance.mdx","sourceDirName":".","slug":"/performance","permalink":"/Rizz-Sharp/docs/docs/performance","draft":false,"unlisted":false,"editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/performance.mdx","tags":[],"version":"current","frontMatter":{"sidebar-position":4},"sidebar":"tutorialSidebar","previous":{"title":"Errors","permalink":"/Rizz-Sharp/docs/docs/errors"}}'
      );
      var o = t(4848),
        s = t(8453);
      const a = { "sidebar-position": 4 },
        c = "Unparalleled Performance",
        i = {},
        d = [];
      function l(e) {
        const r = {
          h1: "h1",
          header: "header",
          p: "p",
          strong: "strong",
          ...(0, s.R)(),
          ...e.components,
        };
        return (0, o.jsxs)(o.Fragment, {
          children: [
            (0, o.jsx)(r.header, {
              children: (0, o.jsx)(r.h1, {
                id: "unparalleled-performance",
                children: "Unparalleled Performance",
              }),
            }),
            "\n",
            (0, o.jsx)(r.p, {
              children:
                "Rizzlers need to spend their time on scalable, feature-rich code. Let Rizz#",
            }),
            "\n",
            (0, o.jsx)("img", { src: "/Rizz-Sharp/docs/img/performance.png" }),
            "\n",
            (0, o.jsxs)(r.p, {
              children: [
                (0, o.jsx)(r.strong, { children: "Do not" }),
                " look too hard at that chart.",
              ],
            }),
          ],
        });
      }
      function p(e = {}) {
        const { wrapper: r } = { ...(0, s.R)(), ...e.components };
        return r
          ? (0, o.jsx)(r, { ...e, children: (0, o.jsx)(l, { ...e }) })
          : l(e);
      }
    },
    8453: (e, r, t) => {
      t.d(r, { R: () => a, x: () => c });
      var n = t(6540);
      const o = {},
        s = n.createContext(o);
      function a(e) {
        const r = n.useContext(s);
        return n.useMemo(
          function () {
            return "function" == typeof e ? e(r) : { ...r, ...e };
          },
          [r, e]
        );
      }
      function c(e) {
        let r;
        return (
          (r = e.disableParentContext
            ? "function" == typeof e.components
              ? e.components(o)
              : e.components || o
            : a(e.components)),
          n.createElement(s.Provider, { value: r }, e.children)
        );
      }
    },
  },
]);
