// Yard Dog Landscapes design-system entry.
//
// The brand is a static HTML site: there is no React component library and no
// build. This entry exists so the converter can resolve a package entry and
// emit the brand token layer into _ds_bundle.css; the component surface is
// intentionally empty, which the converter reports as a tokens-only DS.
//
// The site's real stylesheet (styles.css, 195 pages) rides in verbatim through
// cfg.cssEntry — it must NOT be imported here, because it references 25 photo
// url()s and a remote Google Fonts @import that esbuild would try to resolve.
import './brand-tokens.css';

export {};
