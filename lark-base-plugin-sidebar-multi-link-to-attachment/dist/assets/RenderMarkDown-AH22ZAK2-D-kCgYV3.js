import{z as e,O as t,q as n,M as r,T as l,E as i,W as o,D as a}from"./index-CittfNdq.js";import"./vendor-CtxeQirF.js";import"./antd-C6Wprstt.js";var u=i((e,t)=>{t.exports=function(e){return null!=e&&null!=e.constructor&&"function"==typeof e.constructor.isBuffer&&e.constructor.isBuffer(e)}}),s=i((e,t)=>{var n=Object.prototype.hasOwnProperty,r=Object.prototype.toString,l=Object.defineProperty,i=Object.getOwnPropertyDescriptor,o=function(e){return"function"==typeof Array.isArray?Array.isArray(e):"[object Array]"===r.call(e)},a=function(e){if(!e||"[object Object]"!==r.call(e))return!1;var t,l=n.call(e,"constructor"),i=e.constructor&&e.constructor.prototype&&n.call(e.constructor.prototype,"isPrototypeOf");if(e.constructor&&!l&&!i)return!1;for(t in e);return void 0===t||n.call(e,t)},u=function(e,t){l&&"__proto__"===t.name?l(e,t.name,{enumerable:!0,configurable:!0,value:t.newValue,writable:!0}):e[t.name]=t.newValue},s=function(e,t){if("__proto__"===t){if(!n.call(e,t))return;if(i)return i(e,t).value}return e[t]};t.exports=function e(){var t,n,r,l,i,c,f=arguments[0],p=1,d=arguments.length,h=!1;for("boolean"==typeof f&&(h=f,f=arguments[1]||{},p=2),(null==f||"object"!=typeof f&&"function"!=typeof f)&&(f={});p<d;++p)if(null!=(t=arguments[p]))for(n in t)r=s(f,n),f!==(l=s(t,n))&&(h&&l&&(a(l)||(i=o(l)))?(i?(i=!1,c=r&&o(r)?r:[]):c=r&&a(r)?r:{},u(f,{name:n,newValue:e(h,c,l)})):void 0!==l&&u(f,{name:n,newValue:l}));return f}}),c=i((e,t)=>{t.exports="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"}),f=i((e,t)=>{var n=c();function r(){}function l(){}l.resetWarningCache=r,t.exports=function(){function e(e,t,r,l,i,o){if(o!==n){var a=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw a.name="Invariant Violation",a}}function t(){return e}e.isRequired=e;var i={array:e,bigint:e,bool:e,func:e,number:e,object:e,string:e,symbol:e,any:e,arrayOf:t,element:e,elementType:e,instanceOf:t,node:e,objectOf:t,oneOf:t,oneOfType:t,shape:t,exact:t,checkPropTypes:l,resetWarningCache:r};return i.PropTypes=i,i}}),p=i((e,t)=>{t.exports=f()()}),d=i((e,t)=>{var n=/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g,r=/\n/g,l=/^\s*/,i=/^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/,o=/^:\s*/,a=/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/,u=/^[;\s]*/,s=/^\s+|\s+$/g,c="";function f(e){return e?e.replace(s,c):c}t.exports=function(e,t){if("string"!=typeof e)throw new TypeError("First argument must be a string");if(!e)return[];t=t||{};var s=1,p=1;function d(e){var t=e.match(r);t&&(s+=t.length);var n=e.lastIndexOf("\n");p=~n?e.length-n:p+e.length}function h(){var e={line:s,column:p};return function(t){return t.position=new g(e),b(),t}}function g(e){this.start=e,this.end={line:s,column:p},this.source=t.source}function m(n){var r=new Error(t.source+":"+s+":"+p+": "+n);if(r.reason=n,r.filename=t.source,r.line=s,r.column=p,r.source=e,!t.silent)throw r}function y(t){var n=t.exec(e);if(n){var r=n[0];return d(r),e=e.slice(r.length),n}}function b(){y(l)}function k(e){var t;for(e=e||[];t=x();)!1!==t&&e.push(t);return e}function x(){var t=h();if("/"==e.charAt(0)&&"*"==e.charAt(1)){for(var n=2;c!=e.charAt(n)&&("*"!=e.charAt(n)||"/"!=e.charAt(n+1));)++n;if(n+=2,c===e.charAt(n-1))return m("End of comment missing");var r=e.slice(2,n-2);return p+=2,d(r),e=e.slice(n),p+=2,t({type:"comment",comment:r})}}function v(){var e=h(),t=y(i);if(t){if(x(),!y(o))return m("property missing ':'");var r=y(a),l=e({type:"declaration",property:f(t[0].replace(n,c)),value:r?f(r[0].replace(n,c)):c});return y(u),l}}return g.prototype.content=e,b(),function(){var e,t=[];for(k(t);e=v();)!1!==e&&(t.push(e),k(t));return t}()}}),h=i((e,t)=>{var n=d();function r(e,t){var r=null;if(!e||"string"!=typeof e)return r;for(var l,i,o,a=n(e),u="function"==typeof t,s=0,c=a.length;s<c;s++)i=(l=a[s]).property,o=l.value,u?t(i,o,l):o&&(r||(r={}),r[i]=o);return r}t.exports=r,t.exports.default=r}),g=e(n(),1),m=["http","https","mailto","tel"];function y(e){let t=(e||"").trim(),n=t.charAt(0);if("#"===n||"/"===n)return t;let r=t.indexOf(":");if(-1===r)return t;let l=-1;for(;++l<m.length;){let e=m[l];if(r===e.length&&t.slice(0,e.length).toLowerCase()===e)return t}return l=t.indexOf("?"),-1!==l&&r>l||(l=t.indexOf("#"),-1!==l&&r>l)?t:"javascript:void(0)"}var b=e(t(),1),k=e(u(),1);function x(e){return e&&"object"==typeof e?"position"in e||"type"in e?w(e.position):"start"in e||"end"in e?w(e):"line"in e||"column"in e?v(e):"":""}function v(e){return S(e&&e.line)+":"+S(e&&e.column)}function w(e){return v(e&&e.start)+"-"+v(e&&e.end)}function S(e){return e&&"number"==typeof e?e:1}var C=class extends Error{constructor(e,t,n){let r=[null,null],l={start:{line:null,column:null},end:{line:null,column:null}};if(super(),"string"==typeof t&&(n=t,t=void 0),"string"==typeof n){let e=n.indexOf(":");-1===e?r[1]=n:(r[0]=n.slice(0,e),r[1]=n.slice(e+1))}t&&("type"in t||"position"in t?t.position&&(l=t.position):"start"in t||"end"in t?l=t:("line"in t||"column"in t)&&(l.start=t)),this.name=x(t)||"1:1",this.message="object"==typeof e?e.message:e,this.stack="","object"==typeof e&&e.stack&&(this.stack=e.stack),this.reason=this.message,this.fatal,this.line=l.start.line,this.column=l.start.column,this.position=l,this.source=r[0],this.ruleId=r[1],this.file,this.actual,this.expected,this.url,this.note}};C.prototype.file="",C.prototype.name="",C.prototype.reason="",C.prototype.message="",C.prototype.stack="",C.prototype.fatal=null,C.prototype.column=null,C.prototype.line=null,C.prototype.source=null,C.prototype.ruleId=null,C.prototype.position=null;var E={basename:function(e,t){if(void 0!==t&&"string"!=typeof t)throw new TypeError('"ext" argument must be a string');F(e);let n,r=0,l=-1,i=e.length;if(void 0===t||0===t.length||t.length>e.length){for(;i--;)if(47===e.charCodeAt(i)){if(n){r=i+1;break}}else l<0&&(n=!0,l=i+1);return l<0?"":e.slice(r,l)}if(t===e)return"";let o=-1,a=t.length-1;for(;i--;)if(47===e.charCodeAt(i)){if(n){r=i+1;break}}else o<0&&(n=!0,o=i+1),a>-1&&(e.charCodeAt(i)===t.charCodeAt(a--)?a<0&&(l=i):(a=-1,l=o));return r===l?l=o:l<0&&(l=e.length),e.slice(r,l)},dirname:function(e){if(F(e),0===e.length)return".";let t,n=-1,r=e.length;for(;--r;)if(47===e.charCodeAt(r)){if(t){n=r;break}}else t||(t=!0);return n<0?47===e.charCodeAt(0)?"/":".":1===n&&47===e.charCodeAt(0)?"//":e.slice(0,n)},extname:function(e){F(e);let t,n=e.length,r=-1,l=0,i=-1,o=0;for(;n--;){let a=e.charCodeAt(n);if(47!==a)r<0&&(t=!0,r=n+1),46===a?i<0?i=n:1!==o&&(o=1):i>-1&&(o=-1);else if(t){l=n+1;break}}return i<0||r<0||0===o||1===o&&i===r-1&&i===l+1?"":e.slice(i,r)},join:function(...e){let t,n=-1;for(;++n<e.length;)F(e[n]),e[n]&&(t=void 0===t?e[n]:t+"/"+e[n]);return void 0===t?".":function(e){F(e);let t=47===e.charCodeAt(0),n=function(e,t){let n,r,l="",i=0,o=-1,a=0,u=-1;for(;++u<=e.length;){if(u<e.length)n=e.charCodeAt(u);else{if(47===n)break;n=47}if(47===n){if(o!==u-1&&1!==a)if(o!==u-1&&2===a){if(l.length<2||2!==i||46!==l.charCodeAt(l.length-1)||46!==l.charCodeAt(l.length-2))if(l.length>2){if(r=l.lastIndexOf("/"),r!==l.length-1){r<0?(l="",i=0):(l=l.slice(0,r),i=l.length-1-l.lastIndexOf("/")),o=u,a=0;continue}}else if(l.length>0){l="",i=0,o=u,a=0;continue}t&&(l=l.length>0?l+"/..":"..",i=2)}else l.length>0?l+="/"+e.slice(o+1,u):l=e.slice(o+1,u),i=u-o-1;o=u,a=0}else 46===n&&a>-1?a++:a=-1}return l}(e,!t);return 0===n.length&&!t&&(n="."),n.length>0&&47===e.charCodeAt(e.length-1)&&(n+="/"),t?"/"+n:n}(t)},sep:"/"};function F(e){if("string"!=typeof e)throw new TypeError("Path must be a string. Received "+JSON.stringify(e))}var A={cwd:function(){return"/"}};function D(e){return null!==e&&"object"==typeof e&&e.href&&e.origin}function T(e){if("string"==typeof e)e=new URL(e);else if(!D(e)){let t=new TypeError('The "path" argument must be of type string or an instance of URL. Received `'+e+"`");throw t.code="ERR_INVALID_ARG_TYPE",t}if("file:"!==e.protocol){let e=new TypeError("The URL must be of scheme file");throw e.code="ERR_INVALID_URL_SCHEME",e}return function(e){if(""!==e.hostname){let e=new TypeError('File URL host must be "localhost" or empty on darwin');throw e.code="ERR_INVALID_FILE_URL_HOST",e}let t=e.pathname,n=-1;for(;++n<t.length;)if(37===t.charCodeAt(n)&&50===t.charCodeAt(n+1)){let e=t.charCodeAt(n+2);if(70===e||102===e){let e=new TypeError("File URL path must not include encoded / characters");throw e.code="ERR_INVALID_FILE_URL_PATH",e}}return decodeURIComponent(t)}(e)}var O=["history","path","basename","stem","extname","dirname"],L=class{constructor(e){let t;t=e?"string"==typeof e||function(e){return(0,k.default)(e)}(e)?{value:e}:D(e)?{path:e}:e:{},this.data={},this.messages=[],this.history=[],this.cwd=A.cwd(),this.value,this.stored,this.result,this.map;let n,r=-1;for(;++r<O.length;){let e=O[r];e in t&&void 0!==t[e]&&null!==t[e]&&(this[e]="history"===e?[...t[e]]:t[e])}for(n in t)O.includes(n)||(this[n]=t[n])}get path(){return this.history[this.history.length-1]}set path(e){D(e)&&(e=T(e)),I(e,"path"),this.path!==e&&this.history.push(e)}get dirname(){return"string"==typeof this.path?E.dirname(this.path):void 0}set dirname(e){z(this.basename,"dirname"),this.path=E.join(e||"",this.basename)}get basename(){return"string"==typeof this.path?E.basename(this.path):void 0}set basename(e){I(e,"basename"),P(e,"basename"),this.path=E.join(this.dirname||"",e)}get extname(){return"string"==typeof this.path?E.extname(this.path):void 0}set extname(e){if(P(e,"extname"),z(this.dirname,"extname"),e){if(46!==e.charCodeAt(0))throw new Error("`extname` must start with `.`");if(e.includes(".",1))throw new Error("`extname` cannot contain multiple dots")}this.path=E.join(this.dirname,this.stem+(e||""))}get stem(){return"string"==typeof this.path?E.basename(this.path,this.extname):void 0}set stem(e){I(e,"stem"),P(e,"stem"),this.path=E.join(this.dirname||"",e+(this.extname||""))}toString(e){return(this.value||"").toString(e||void 0)}message(e,t,n){let r=new C(e,t,n);return this.path&&(r.name=this.path+":"+r.name,r.file=this.path),r.fatal=!1,this.messages.push(r),r}info(e,t,n){let r=this.message(e,t,n);return r.fatal=null,r}fail(e,t,n){let r=this.message(e,t,n);throw r.fatal=!0,r}};function P(e,t){if(e&&e.includes(E.sep))throw new Error("`"+t+"` cannot be a path: did not expect `"+E.sep+"`")}function I(e,t){if(!e)throw new Error("`"+t+"` cannot be empty")}function z(e,t){if(!e)throw new Error("Setting `"+t+"` requires `path` to be set too")}function M(e){if(e)throw e}var R=e(u(),1),j=e(s(),1);function _(e){if("object"!=typeof e||null===e)return!1;let t=Object.getPrototypeOf(e);return!(null!==t&&t!==Object.prototype&&null!==Object.getPrototypeOf(t)||Symbol.toStringTag in e||Symbol.iterator in e)}function B(){let e=[],t={run:function(...t){let n=-1,r=t.pop();if("function"!=typeof r)throw new TypeError("Expected function as last argument, not "+r);!function l(i,...o){let a=e[++n],u=-1;if(i)r(i);else{for(;++u<t.length;)(null===o[u]||void 0===o[u])&&(o[u]=t[u]);t=o,a?function(e,t){let n;return r;function r(...t){let r,a=e.length>t.length;a&&t.push(l);try{r=e.apply(this,t)}catch(o){if(a&&n)throw o;return l(o)}a||(r&&r.then&&"function"==typeof r.then?r.then(i,l):r instanceof Error?l(r):i(r))}function l(e,...r){n||(n=!0,t(e,...r))}function i(e){l(null,e)}}(a,l)(...o):r(null,...o)}}(null,...t)},use:function(n){if("function"!=typeof n)throw new TypeError("Expected `middelware` to be a function, not "+n);return e.push(n),t}};return t}var N=function e(){let t,n=B(),r=[],l={},i=-1;return o.data=function(e,n){return"string"==typeof e?2===arguments.length?(W("data",t),l[e]=n,o):H.call(l,e)&&l[e]||null:e?(W("data",t),l=e,o):l},o.Parser=void 0,o.Compiler=void 0,o.freeze=function(){if(t)return o;for(;++i<r.length;){let[e,...t]=r[i];if(!1===t[0])continue;!0===t[0]&&(t[0]=void 0);let l=e.call(o,...t);"function"==typeof l&&n.use(l)}return t=!0,i=Number.POSITIVE_INFINITY,o},o.attachers=r,o.use=function(e,...n){let i;if(W("use",t),null!=e)if("function"==typeof e)c(e,...n);else{if("object"!=typeof e)throw new TypeError("Expected usable value, not `"+e+"`");Array.isArray(e)?s(e):u(e)}return i&&(l.settings=Object.assign(l.settings||{},i)),o;function a(e){if("function"==typeof e)c(e);else{if("object"!=typeof e)throw new TypeError("Expected usable value, not `"+e+"`");if(Array.isArray(e)){let[t,...n]=e;c(t,...n)}else u(e)}}function u(e){s(e.plugins),e.settings&&(i=Object.assign(i||{},e.settings))}function s(e){let t=-1;if(null!=e){if(!Array.isArray(e))throw new TypeError("Expected a list of plugins, not `"+e+"`");for(;++t<e.length;){a(e[t])}}}function c(e,t){let n,l=-1;for(;++l<r.length;)if(r[l][0]===e){n=r[l];break}n?(_(n[1])&&_(t)&&(t=(0,j.default)(!0,n[1],t)),n[1]=t):r.push([...arguments])}},o.parse=function(e){o.freeze();let t=Y(e),n=o.Parser;return q("parse",n),U(n,"parse")?new n(String(t),t).parse():n(String(t),t)},o.stringify=function(e,t){o.freeze();let n=Y(t),r=o.Compiler;return V("stringify",r),$(e),U(r,"compile")?new r(e,n).compile():r(e,n)},o.run=function(e,t,r){if($(e),o.freeze(),!r&&"function"==typeof t&&(r=t,t=void 0),!r)return new Promise(l);function l(l,i){function o(t,n,o){n=n||e,t?i(t):l?l(n):r(null,n,o)}n.run(e,Y(t),o)}l(null,r)},o.runSync=function(e,t){let n,r;return o.run(e,t,l),Q("runSync","run",r),n;function l(e,t){M(e),n=t,r=!0}},o.process=function(e,t){if(o.freeze(),q("process",o.Parser),V("process",o.Compiler),!t)return new Promise(n);function n(n,r){let l=Y(e);function i(e,l){e||!l?r(e):n?n(l):t(null,l)}o.run(o.parse(l),l,(e,t,n)=>{if(!e&&t&&n){let r=o.stringify(t,n);null==r||(function(e){return"string"==typeof e||(0,R.default)(e)}(r)?n.value=r:n.result=r),i(e,n)}else i(e)})}n(null,t)},o.processSync=function(e){let t;o.freeze(),q("processSync",o.Parser),V("processSync",o.Compiler);let n=Y(e);return o.process(n,r),Q("processSync","process",t),n;function r(e){t=!0,M(e)}},o;function o(){let t=e(),n=-1;for(;++n<r.length;)t.use(...r[n]);return t.data((0,j.default)(!0,{},l)),t}}().freeze(),H={}.hasOwnProperty;function U(e,t){return"function"==typeof e&&e.prototype&&(function(e){let t;for(t in e)if(H.call(e,t))return!0;return!1}(e.prototype)||t in e.prototype)}function q(e,t){if("function"!=typeof t)throw new TypeError("Cannot `"+e+"` without `Parser`")}function V(e,t){if("function"!=typeof t)throw new TypeError("Cannot `"+e+"` without `Compiler`")}function W(e,t){if(t)throw new Error("Cannot call `"+e+"` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`.")}function $(e){if(!_(e)||"string"!=typeof e.type)throw new TypeError("Expected node, got `"+e+"`")}function Q(e,t,n){if(!n)throw new Error("`"+e+"` finished async. Use `"+t+"` instead")}function Y(e){return function(e){return!!(e&&"object"==typeof e&&"message"in e&&"messages"in e)}(e)?e:new L(e)}var K={};function X(e,t,n){if(function(e){return!(!e||"object"!=typeof e)}(e)){if("value"in e)return"html"!==e.type||n?e.value:"";if(t&&"alt"in e&&e.alt)return e.alt;if("children"in e)return Z(e.children,t,n)}return Array.isArray(e)?Z(e,t,n):""}function Z(e,t,n){let r=[],l=-1;for(;++l<e.length;)r[l]=X(e[l],t,n);return r.join("")}function J(e,t,n,r){let l,i=e.length,o=0;if(t=t<0?-t>i?0:i+t:t>i?i:t,n=n>0?n:0,r.length<1e4)l=Array.from(r),l.unshift(t,n),e.splice(...l);else for(n&&e.splice(t,n);o<r.length;)l=r.slice(o,o+1e4),l.unshift(t,0),e.splice(...l),o+=1e4,t+=1e4}function G(e,t){return e.length>0?(J(e,e.length,0,t),e):t}var ee={}.hasOwnProperty;function te(e){let t={},n=-1;for(;++n<e.length;)ne(t,e[n]);return t}function ne(e,t){let n;for(n in t){let r,l=(ee.call(e,n)?e[n]:void 0)||(e[n]={}),i=t[n];if(i)for(r in i){ee.call(l,r)||(l[r]=[]);let e=i[r];re(l[r],Array.isArray(e)?e:e?[e]:[])}}}function re(e,t){let n=-1,r=[];for(;++n<t.length;)("after"===t[n].add?e:r).push(t[n]);J(e,0,0,r)}var le=me(/[A-Za-z]/),ie=me(/[\dA-Za-z]/),oe=me(/[#-'*+\--9=?A-Z^-~]/);function ae(e){return null!==e&&(e<32||127===e)}var ue=me(/\d/),se=me(/[\dA-Fa-f]/),ce=me(/[!-/:-@[-`{-~]/);function fe(e){return null!==e&&e<-2}function pe(e){return null!==e&&(e<0||32===e)}function de(e){return-2===e||-1===e||32===e}var he=me(/[!-\/:-@\[-`\{-~\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]/),ge=me(/\s/);function me(e){return function(t){return null!==t&&e.test(String.fromCharCode(t))}}function ye(e,t,n,r){let l=r?r-1:Number.POSITIVE_INFINITY,i=0;return function(r){return de(r)?(e.enter(n),o(r)):t(r)};function o(r){return de(r)&&i++<l?(e.consume(r),o):(e.exit(n),t(r))}}var be={tokenize:function(e){let t,n=e.attempt(this.parser.constructs.contentInitial,function(t){if(null===t)return void e.consume(t);return e.enter("lineEnding"),e.consume(t),e.exit("lineEnding"),ye(e,n,"linePrefix")},function(t){return e.enter("paragraph"),r(t)});return n;function r(n){let r=e.enter("chunkText",{contentType:"text",previous:t});return t&&(t.next=r),t=r,l(n)}function l(t){return null===t?(e.exit("chunkText"),e.exit("paragraph"),void e.consume(t)):fe(t)?(e.consume(t),e.exit("chunkText"),r):(e.consume(t),l)}}};var ke={tokenize:function(e){let t,n,r,l=this,i=[],o=0;return a;function a(t){if(o<i.length){let n=i[o];return l.containerState=n[1],e.attempt(n[0].continuation,u,s)(t)}return s(t)}function u(e){if(o++,l.containerState._closeFlow){l.containerState._closeFlow=void 0,t&&b();let n,r=l.events.length,i=r;for(;i--;)if("exit"===l.events[i][0]&&"chunkFlow"===l.events[i][1].type){n=l.events[i][1].end;break}y(o);let a=r;for(;a<l.events.length;)l.events[a][1].end=Object.assign({},n),a++;return J(l.events,i+1,0,l.events.slice(r)),l.events.length=a,s(e)}return a(e)}function s(n){if(o===i.length){if(!t)return p(n);if(t.currentConstruct&&t.currentConstruct.concrete)return h(n);l.interrupt=!(!t.currentConstruct||t._gfmTableDynamicInterruptHack)}return l.containerState={},e.check(xe,c,f)(n)}function c(e){return t&&b(),y(o),p(e)}function f(e){return l.parser.lazy[l.now().line]=o!==i.length,r=l.now().offset,h(e)}function p(t){return l.containerState={},e.attempt(xe,d,h)(t)}function d(e){return o++,i.push([l.currentConstruct,l.containerState]),p(e)}function h(r){return null===r?(t&&b(),y(0),void e.consume(r)):(t=t||l.parser.flow(l.now()),e.enter("chunkFlow",{contentType:"flow",previous:n,_tokenizer:t}),g(r))}function g(t){return null===t?(m(e.exit("chunkFlow"),!0),y(0),void e.consume(t)):fe(t)?(e.consume(t),m(e.exit("chunkFlow")),o=0,l.interrupt=void 0,a):(e.consume(t),g)}function m(e,i){let a=l.sliceStream(e);if(i&&a.push(null),e.previous=n,n&&(n.next=e),n=e,t.defineSkip(e.start),t.write(a),l.parser.lazy[e.start.line]){let e=t.events.length;for(;e--;)if(t.events[e][1].start.offset<r&&(!t.events[e][1].end||t.events[e][1].end.offset>r))return;let n,i,a=l.events.length,u=a;for(;u--;)if("exit"===l.events[u][0]&&"chunkFlow"===l.events[u][1].type){if(n){i=l.events[u][1].end;break}n=!0}for(y(o),e=a;e<l.events.length;)l.events[e][1].end=Object.assign({},i),e++;J(l.events,u+1,0,l.events.slice(a)),l.events.length=e}}function y(t){let n=i.length;for(;n-- >t;){let t=i[n];l.containerState=t[1],t[0].exit.call(l,e)}i.length=t}function b(){t.write([null]),n=void 0,t=void 0,l.containerState._closeFlow=void 0}}},xe={tokenize:function(e,t,n){return ye(e,e.attempt(this.parser.constructs.document,t,n),"linePrefix",this.parser.constructs.disable.null.includes("codeIndented")?void 0:4)}};function ve(e){return null===e||pe(e)||ge(e)?1:he(e)?2:void 0}function we(e,t,n){let r=[],l=-1;for(;++l<e.length;){let i=e[l].resolveAll;i&&!r.includes(i)&&(t=i(t,n),r.push(i))}return t}var Se={name:"attention",tokenize:function(e,t){let n,r=this.parser.constructs.attentionMarkers.null,l=this.previous,i=ve(l);return function(t){return n=t,e.enter("attentionSequence"),o(t)};function o(a){if(a===n)return e.consume(a),o;let u=e.exit("attentionSequence"),s=ve(a),c=!s||2===s&&i||r.includes(a),f=!i||2===i&&s||r.includes(l);return u._open=!!(42===n?c:c&&(i||!f)),u._close=!!(42===n?f:f&&(s||!c)),t(a)}},resolveAll:function(e,t){let n,r,l,i,o,a,u,s,c=-1;for(;++c<e.length;)if("enter"===e[c][0]&&"attentionSequence"===e[c][1].type&&e[c][1]._close)for(n=c;n--;)if("exit"===e[n][0]&&"attentionSequence"===e[n][1].type&&e[n][1]._open&&t.sliceSerialize(e[n][1]).charCodeAt(0)===t.sliceSerialize(e[c][1]).charCodeAt(0)){if((e[n][1]._close||e[c][1]._open)&&(e[c][1].end.offset-e[c][1].start.offset)%3&&!((e[n][1].end.offset-e[n][1].start.offset+e[c][1].end.offset-e[c][1].start.offset)%3))continue;a=e[n][1].end.offset-e[n][1].start.offset>1&&e[c][1].end.offset-e[c][1].start.offset>1?2:1;let f=Object.assign({},e[n][1].end),p=Object.assign({},e[c][1].start);Ce(f,-a),Ce(p,a),i={type:a>1?"strongSequence":"emphasisSequence",start:f,end:Object.assign({},e[n][1].end)},o={type:a>1?"strongSequence":"emphasisSequence",start:Object.assign({},e[c][1].start),end:p},l={type:a>1?"strongText":"emphasisText",start:Object.assign({},e[n][1].end),end:Object.assign({},e[c][1].start)},r={type:a>1?"strong":"emphasis",start:Object.assign({},i.start),end:Object.assign({},o.end)},e[n][1].end=Object.assign({},i.start),e[c][1].start=Object.assign({},o.end),u=[],e[n][1].end.offset-e[n][1].start.offset&&(u=G(u,[["enter",e[n][1],t],["exit",e[n][1],t]])),u=G(u,[["enter",r,t],["enter",i,t],["exit",i,t],["enter",l,t]]),u=G(u,we(t.parser.constructs.insideSpan.null,e.slice(n+1,c),t)),u=G(u,[["exit",l,t],["enter",o,t],["exit",o,t],["exit",r,t]]),e[c][1].end.offset-e[c][1].start.offset?(s=2,u=G(u,[["enter",e[c][1],t],["exit",e[c][1],t]])):s=0,J(e,n-1,c-n+3,u),c=n+u.length-s-2;break}for(c=-1;++c<e.length;)"attentionSequence"===e[c][1].type&&(e[c][1].type="data");return e}};function Ce(e,t){e.column+=t,e.offset+=t,e._bufferIndex+=t}var Ee={name:"autolink",tokenize:function(e,t,n){let r=0;return function(t){return e.enter("autolink"),e.enter("autolinkMarker"),e.consume(t),e.exit("autolinkMarker"),e.enter("autolinkProtocol"),l};function l(t){return le(t)?(e.consume(t),i):u(t)}function i(e){return 43===e||45===e||46===e||ie(e)?(r=1,o(e)):u(e)}function o(t){return 58===t?(e.consume(t),r=0,a):(43===t||45===t||46===t||ie(t))&&r++<32?(e.consume(t),o):(r=0,u(t))}function a(r){return 62===r?(e.exit("autolinkProtocol"),e.enter("autolinkMarker"),e.consume(r),e.exit("autolinkMarker"),e.exit("autolink"),t):null===r||32===r||60===r||ae(r)?n(r):(e.consume(r),a)}function u(t){return 64===t?(e.consume(t),s):oe(t)?(e.consume(t),u):n(t)}function s(e){return ie(e)?c(e):n(e)}function c(n){return 46===n?(e.consume(n),r=0,s):62===n?(e.exit("autolinkProtocol").type="autolinkEmail",e.enter("autolinkMarker"),e.consume(n),e.exit("autolinkMarker"),e.exit("autolink"),t):f(n)}function f(t){if((45===t||ie(t))&&r++<63){let n=45===t?f:c;return e.consume(t),n}return n(t)}}};var Fe={tokenize:function(e,t,n){return function(t){return de(t)?ye(e,r,"linePrefix")(t):r(t)};function r(e){return null===e||fe(e)?t(e):n(e)}},partial:!0};var Ae={name:"blockQuote",tokenize:function(e,t,n){let r=this;return function(t){if(62===t){let n=r.containerState;return n.open||(e.enter("blockQuote",{_container:!0}),n.open=!0),e.enter("blockQuotePrefix"),e.enter("blockQuoteMarker"),e.consume(t),e.exit("blockQuoteMarker"),l}return n(t)};function l(n){return de(n)?(e.enter("blockQuotePrefixWhitespace"),e.consume(n),e.exit("blockQuotePrefixWhitespace"),e.exit("blockQuotePrefix"),t):(e.exit("blockQuotePrefix"),t(n))}},continuation:{tokenize:function(e,t,n){let r=this;return function(t){return de(t)?ye(e,l,"linePrefix",r.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(t):l(t)};function l(r){return e.attempt(Ae,t,n)(r)}}},exit:function(e){e.exit("blockQuote")}};var De={name:"characterEscape",tokenize:function(e,t,n){return function(t){return e.enter("characterEscape"),e.enter("escapeMarker"),e.consume(t),e.exit("escapeMarker"),r};function r(r){return ce(r)?(e.enter("characterEscapeValue"),e.consume(r),e.exit("characterEscapeValue"),e.exit("characterEscape"),t):n(r)}}};var Te=document.createElement("i");function Oe(e){let t="&"+e+";";Te.innerHTML=t;let n=Te.textContent;return(59!==n.charCodeAt(n.length-1)||"semi"===e)&&n!==t&&n}var Le={name:"characterReference",tokenize:function(e,t,n){let r,l,i=this,o=0;return function(t){return e.enter("characterReference"),e.enter("characterReferenceMarker"),e.consume(t),e.exit("characterReferenceMarker"),a};function a(t){return 35===t?(e.enter("characterReferenceMarkerNumeric"),e.consume(t),e.exit("characterReferenceMarkerNumeric"),u):(e.enter("characterReferenceValue"),r=31,l=ie,s(t))}function u(t){return 88===t||120===t?(e.enter("characterReferenceMarkerHexadecimal"),e.consume(t),e.exit("characterReferenceMarkerHexadecimal"),e.enter("characterReferenceValue"),r=6,l=se,s):(e.enter("characterReferenceValue"),r=7,l=ue,s(t))}function s(a){if(59===a&&o){let r=e.exit("characterReferenceValue");return l!==ie||Oe(i.sliceSerialize(r))?(e.enter("characterReferenceMarker"),e.consume(a),e.exit("characterReferenceMarker"),e.exit("characterReference"),t):n(a)}return l(a)&&o++<r?(e.consume(a),s):n(a)}}};var Pe={tokenize:function(e,t,n){let r=this;return function(t){return null===t?n(t):(e.enter("lineEnding"),e.consume(t),e.exit("lineEnding"),l)};function l(e){return r.parser.lazy[r.now().line]?n(e):t(e)}},partial:!0},Ie={name:"codeFenced",tokenize:function(e,t,n){let r,l=this,i={tokenize:function(e,t,n){let i=0;return o;function o(t){return e.enter("lineEnding"),e.consume(t),e.exit("lineEnding"),u}function u(t){return e.enter("codeFencedFence"),de(t)?ye(e,s,"linePrefix",l.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(t):s(t)}function s(t){return t===r?(e.enter("codeFencedFenceSequence"),c(t)):n(t)}function c(t){return t===r?(i++,e.consume(t),c):i>=a?(e.exit("codeFencedFenceSequence"),de(t)?ye(e,f,"whitespace")(t):f(t)):n(t)}function f(r){return null===r||fe(r)?(e.exit("codeFencedFence"),t(r)):n(r)}},partial:!0},o=0,a=0;return function(t){return function(t){let n=l.events[l.events.length-1];return o=n&&"linePrefix"===n[1].type?n[2].sliceSerialize(n[1],!0).length:0,r=t,e.enter("codeFenced"),e.enter("codeFencedFence"),e.enter("codeFencedFenceSequence"),u(t)}(t)};function u(t){return t===r?(a++,e.consume(t),u):a<3?n(t):(e.exit("codeFencedFenceSequence"),de(t)?ye(e,s,"whitespace")(t):s(t))}function s(n){return null===n||fe(n)?(e.exit("codeFencedFence"),l.interrupt?t(n):e.check(Pe,d,b)(n)):(e.enter("codeFencedFenceInfo"),e.enter("chunkString",{contentType:"string"}),c(n))}function c(t){return null===t||fe(t)?(e.exit("chunkString"),e.exit("codeFencedFenceInfo"),s(t)):de(t)?(e.exit("chunkString"),e.exit("codeFencedFenceInfo"),ye(e,f,"whitespace")(t)):96===t&&t===r?n(t):(e.consume(t),c)}function f(t){return null===t||fe(t)?s(t):(e.enter("codeFencedFenceMeta"),e.enter("chunkString",{contentType:"string"}),p(t))}function p(t){return null===t||fe(t)?(e.exit("chunkString"),e.exit("codeFencedFenceMeta"),s(t)):96===t&&t===r?n(t):(e.consume(t),p)}function d(t){return e.attempt(i,b,h)(t)}function h(t){return e.enter("lineEnding"),e.consume(t),e.exit("lineEnding"),g}function g(t){return o>0&&de(t)?ye(e,m,"linePrefix",o+1)(t):m(t)}function m(t){return null===t||fe(t)?e.check(Pe,d,b)(t):(e.enter("codeFlowValue"),y(t))}function y(t){return null===t||fe(t)?(e.exit("codeFlowValue"),m(t)):(e.consume(t),y)}function b(n){return e.exit("codeFenced"),t(n)}},concrete:!0};var ze={name:"codeIndented",tokenize:function(e,t,n){let r=this;return function(t){return e.enter("codeIndented"),ye(e,l,"linePrefix",5)(t)};function l(e){let t=r.events[r.events.length-1];return t&&"linePrefix"===t[1].type&&t[2].sliceSerialize(t[1],!0).length>=4?i(e):n(e)}function i(t){return null===t?a(t):fe(t)?e.attempt(Me,i,a)(t):(e.enter("codeFlowValue"),o(t))}function o(t){return null===t||fe(t)?(e.exit("codeFlowValue"),i(t)):(e.consume(t),o)}function a(n){return e.exit("codeIndented"),t(n)}}},Me={tokenize:function(e,t,n){let r=this;return l;function l(t){return r.parser.lazy[r.now().line]?n(t):fe(t)?(e.enter("lineEnding"),e.consume(t),e.exit("lineEnding"),l):ye(e,i,"linePrefix",5)(t)}function i(e){let i=r.events[r.events.length-1];return i&&"linePrefix"===i[1].type&&i[2].sliceSerialize(i[1],!0).length>=4?t(e):fe(e)?l(e):n(e)}},partial:!0};var Re={name:"codeText",tokenize:function(e,t,n){let r,l,i=0;return function(t){return e.enter("codeText"),e.enter("codeTextSequence"),o(t)};function o(t){return 96===t?(e.consume(t),i++,o):(e.exit("codeTextSequence"),a(t))}function a(t){return null===t?n(t):32===t?(e.enter("space"),e.consume(t),e.exit("space"),a):96===t?(l=e.enter("codeTextSequence"),r=0,s(t)):fe(t)?(e.enter("lineEnding"),e.consume(t),e.exit("lineEnding"),a):(e.enter("codeTextData"),u(t))}function u(t){return null===t||32===t||96===t||fe(t)?(e.exit("codeTextData"),a(t)):(e.consume(t),u)}function s(n){return 96===n?(e.consume(n),r++,s):r===i?(e.exit("codeTextSequence"),e.exit("codeText"),t(n)):(l.type="codeTextData",u(n))}},resolve:function(e){let t,n,r=e.length-4,l=3;if(!("lineEnding"!==e[l][1].type&&"space"!==e[l][1].type||"lineEnding"!==e[r][1].type&&"space"!==e[r][1].type))for(t=l;++t<r;)if("codeTextData"===e[t][1].type){e[l][1].type="codeTextPadding",e[r][1].type="codeTextPadding",l+=2,r-=2;break}for(t=l-1,r++;++t<=r;)void 0===n?t!==r&&"lineEnding"!==e[t][1].type&&(n=t):(t===r||"lineEnding"===e[t][1].type)&&(e[n][1].type="codeTextData",t!==n+2&&(e[n][1].end=e[t-1][1].end,e.splice(n+2,t-n-2),r-=t-n-2,t=n+2),n=void 0);return e},previous:function(e){return 96!==e||"characterEscape"===this.events[this.events.length-1][1].type}};function je(e){let t,n,r,l,i,o,a,u={},s=-1;for(;++s<e.length;){for(;s in u;)s=u[s];if(t=e[s],s&&"chunkFlow"===t[1].type&&"listItemPrefix"===e[s-1][1].type&&(o=t[1]._tokenizer.events,r=0,r<o.length&&"lineEndingBlank"===o[r][1].type&&(r+=2),r<o.length&&"content"===o[r][1].type))for(;++r<o.length&&"content"!==o[r][1].type;)"chunkText"===o[r][1].type&&(o[r][1]._isInFirstContentOfListItem=!0,r++);if("enter"===t[0])t[1].contentType&&(Object.assign(u,_e(e,s)),s=u[s],a=!0);else if(t[1]._container){for(r=s,n=void 0;r--&&(l=e[r],"lineEnding"===l[1].type||"lineEndingBlank"===l[1].type);)"enter"===l[0]&&(n&&(e[n][1].type="lineEndingBlank"),l[1].type="lineEnding",n=r);n&&(t[1].end=Object.assign({},e[n][1].start),i=e.slice(n,s),i.unshift(t),J(e,n,s-n+1,i))}}return!a}function _e(e,t){let n,r,l=e[t][1],i=e[t][2],o=t-1,a=[],u=l._tokenizer||i.parser[l.contentType](l.start),s=u.events,c=[],f={},p=-1,d=l,h=0,g=0,m=[g];for(;d;){for(;e[++o][1]!==d;);a.push(o),d._tokenizer||(n=i.sliceStream(d),d.next||n.push(null),r&&u.defineSkip(d.start),d._isInFirstContentOfListItem&&(u._gfmTasklistFirstContentOfListItem=!0),u.write(n),d._isInFirstContentOfListItem&&(u._gfmTasklistFirstContentOfListItem=void 0)),r=d,d=d.next}for(d=l;++p<s.length;)"exit"===s[p][0]&&"enter"===s[p-1][0]&&s[p][1].type===s[p-1][1].type&&s[p][1].start.line!==s[p][1].end.line&&(g=p+1,m.push(g),d._tokenizer=void 0,d.previous=void 0,d=d.next);for(u.events=[],d?(d._tokenizer=void 0,d.previous=void 0):m.pop(),p=m.length;p--;){let t=s.slice(m[p],m[p+1]),n=a.pop();c.unshift([n,n+t.length-1]),J(e,n,2,t)}for(p=-1;++p<c.length;)f[h+c[p][0]]=h+c[p][1],h+=c[p][1]-c[p][0]-1;return f}var Be={tokenize:function(e,t){let n;return function(t){return e.enter("content"),n=e.enter("chunkContent",{contentType:"content"}),r(t)};function r(t){return null===t?l(t):fe(t)?e.check(Ne,i,l)(t):(e.consume(t),r)}function l(n){return e.exit("chunkContent"),e.exit("content"),t(n)}function i(t){return e.consume(t),e.exit("chunkContent"),n.next=e.enter("chunkContent",{contentType:"content",previous:n}),n=n.next,r}},resolve:function(e){return je(e),e}},Ne={tokenize:function(e,t,n){let r=this;return function(t){return e.exit("chunkContent"),e.enter("lineEnding"),e.consume(t),e.exit("lineEnding"),ye(e,l,"linePrefix")};function l(l){if(null===l||fe(l))return n(l);let i=r.events[r.events.length-1];return!r.parser.constructs.disable.null.includes("codeIndented")&&i&&"linePrefix"===i[1].type&&i[2].sliceSerialize(i[1],!0).length>=4?t(l):e.interrupt(r.parser.constructs.flow,n,t)(l)}},partial:!0};function He(e,t,n,r,l,i,o,a,u){let s=u||Number.POSITIVE_INFINITY,c=0;return function(t){return 60===t?(e.enter(r),e.enter(l),e.enter(i),e.consume(t),e.exit(i),f):null===t||32===t||41===t||ae(t)?n(t):(e.enter(r),e.enter(o),e.enter(a),e.enter("chunkString",{contentType:"string"}),h(t))};function f(n){return 62===n?(e.enter(i),e.consume(n),e.exit(i),e.exit(l),e.exit(r),t):(e.enter(a),e.enter("chunkString",{contentType:"string"}),p(n))}function p(t){return 62===t?(e.exit("chunkString"),e.exit(a),f(t)):null===t||60===t||fe(t)?n(t):(e.consume(t),92===t?d:p)}function d(t){return 60===t||62===t||92===t?(e.consume(t),p):p(t)}function h(l){return c||null!==l&&41!==l&&!pe(l)?c<s&&40===l?(e.consume(l),c++,h):41===l?(e.consume(l),c--,h):null===l||32===l||40===l||ae(l)?n(l):(e.consume(l),92===l?g:h):(e.exit("chunkString"),e.exit(a),e.exit(o),e.exit(r),t(l))}function g(t){return 40===t||41===t||92===t?(e.consume(t),h):h(t)}}function Ue(e,t,n,r,l,i){let o,a=this,u=0;return function(t){return e.enter(r),e.enter(l),e.consume(t),e.exit(l),e.enter(i),s};function s(f){return u>999||null===f||91===f||93===f&&!o||94===f&&!u&&"_hiddenFootnoteSupport"in a.parser.constructs?n(f):93===f?(e.exit(i),e.enter(l),e.consume(f),e.exit(l),e.exit(r),t):fe(f)?(e.enter("lineEnding"),e.consume(f),e.exit("lineEnding"),s):(e.enter("chunkString",{contentType:"string"}),c(f))}function c(t){return null===t||91===t||93===t||fe(t)||u++>999?(e.exit("chunkString"),s(t)):(e.consume(t),o||(o=!de(t)),92===t?f:c)}function f(t){return 91===t||92===t||93===t?(e.consume(t),u++,c):c(t)}}function qe(e,t,n,r,l,i){let o;return function(t){return 34===t||39===t||40===t?(e.enter(r),e.enter(l),e.consume(t),e.exit(l),o=40===t?41:t,a):n(t)};function a(n){return n===o?(e.enter(l),e.consume(n),e.exit(l),e.exit(r),t):(e.enter(i),u(n))}function u(t){return t===o?(e.exit(i),a(o)):null===t?n(t):fe(t)?(e.enter("lineEnding"),e.consume(t),e.exit("lineEnding"),ye(e,u,"linePrefix")):(e.enter("chunkString",{contentType:"string"}),s(t))}function s(t){return t===o||null===t||fe(t)?(e.exit("chunkString"),u(t)):(e.consume(t),92===t?c:s)}function c(t){return t===o||92===t?(e.consume(t),s):s(t)}}function Ve(e,t){let n;return function r(l){return fe(l)?(e.enter("lineEnding"),e.consume(l),e.exit("lineEnding"),n=!0,r):de(l)?ye(e,r,n?"linePrefix":"lineSuffix")(l):t(l)}}function We(e){return e.replace(/[\t\n\r ]+/g," ").replace(/^ | $/g,"").toLowerCase().toUpperCase()}var $e={name:"definition",tokenize:function(e,t,n){let r,l=this;return function(t){return e.enter("definition"),function(t){return Ue.call(l,e,i,n,"definitionLabel","definitionLabelMarker","definitionLabelString")(t)}(t)};function i(t){return r=We(l.sliceSerialize(l.events[l.events.length-1][1]).slice(1,-1)),58===t?(e.enter("definitionMarker"),e.consume(t),e.exit("definitionMarker"),o):n(t)}function o(t){return pe(t)?Ve(e,a)(t):a(t)}function a(t){return He(e,u,n,"definitionDestination","definitionDestinationLiteral","definitionDestinationLiteralMarker","definitionDestinationRaw","definitionDestinationString")(t)}function u(t){return e.attempt(Qe,s,s)(t)}function s(t){return de(t)?ye(e,c,"whitespace")(t):c(t)}function c(i){return null===i||fe(i)?(e.exit("definition"),l.parser.defined.push(r),t(i)):n(i)}}},Qe={tokenize:function(e,t,n){return function(t){return pe(t)?Ve(e,r)(t):n(t)};function r(t){return qe(e,l,n,"definitionTitle","definitionTitleMarker","definitionTitleString")(t)}function l(t){return de(t)?ye(e,i,"whitespace")(t):i(t)}function i(e){return null===e||fe(e)?t(e):n(e)}},partial:!0};var Ye={name:"hardBreakEscape",tokenize:function(e,t,n){return function(t){return e.enter("hardBreakEscape"),e.consume(t),r};function r(r){return fe(r)?(e.exit("hardBreakEscape"),t(r)):n(r)}}};var Ke={name:"headingAtx",tokenize:function(e,t,n){let r=0;return function(t){return e.enter("atxHeading"),function(t){return e.enter("atxHeadingSequence"),l(t)}(t)};function l(t){return 35===t&&r++<6?(e.consume(t),l):null===t||pe(t)?(e.exit("atxHeadingSequence"),i(t)):n(t)}function i(n){return 35===n?(e.enter("atxHeadingSequence"),o(n)):null===n||fe(n)?(e.exit("atxHeading"),t(n)):de(n)?ye(e,i,"whitespace")(n):(e.enter("atxHeadingText"),a(n))}function o(t){return 35===t?(e.consume(t),o):(e.exit("atxHeadingSequence"),i(t))}function a(t){return null===t||35===t||pe(t)?(e.exit("atxHeadingText"),i(t)):(e.consume(t),a)}},resolve:function(e,t){let n,r,l=e.length-2,i=3;return"whitespace"===e[i][1].type&&(i+=2),l-2>i&&"whitespace"===e[l][1].type&&(l-=2),"atxHeadingSequence"===e[l][1].type&&(i===l-1||l-4>i&&"whitespace"===e[l-2][1].type)&&(l-=i+1===l?2:4),l>i&&(n={type:"atxHeadingText",start:e[i][1].start,end:e[l][1].end},r={type:"chunkText",start:e[i][1].start,end:e[l][1].end,contentType:"text"},J(e,i,l-i+1,[["enter",n,t],["enter",r,t],["exit",r,t],["exit",n,t]])),e}};var Xe=["address","article","aside","base","basefont","blockquote","body","caption","center","col","colgroup","dd","details","dialog","dir","div","dl","dt","fieldset","figcaption","figure","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hr","html","iframe","legend","li","link","main","menu","menuitem","nav","noframes","ol","optgroup","option","p","param","search","section","summary","table","tbody","td","tfoot","th","thead","title","tr","track","ul"],Ze=["pre","script","style","textarea"],Je={name:"htmlFlow",tokenize:function(e,t,n){let r,l,i,o,a,u=this;return function(t){return function(t){return e.enter("htmlFlow"),e.enter("htmlFlowData"),e.consume(t),s}(t)};function s(o){return 33===o?(e.consume(o),c):47===o?(e.consume(o),l=!0,d):63===o?(e.consume(o),r=3,u.interrupt?t:z):le(o)?(e.consume(o),i=String.fromCharCode(o),h):n(o)}function c(l){return 45===l?(e.consume(l),r=2,f):91===l?(e.consume(l),r=5,o=0,p):le(l)?(e.consume(l),r=4,u.interrupt?t:z):n(l)}function f(r){return 45===r?(e.consume(r),u.interrupt?t:z):n(r)}function p(r){let l="CDATA[";return r===l.charCodeAt(o++)?(e.consume(r),6===o?u.interrupt?t:F:p):n(r)}function d(t){return le(t)?(e.consume(t),i=String.fromCharCode(t),h):n(t)}function h(o){if(null===o||47===o||62===o||pe(o)){let a=47===o,s=i.toLowerCase();return a||l||!Ze.includes(s)?Xe.includes(i.toLowerCase())?(r=6,a?(e.consume(o),g):u.interrupt?t(o):F(o)):(r=7,u.interrupt&&!u.parser.lazy[u.now().line]?n(o):l?m(o):y(o)):(r=1,u.interrupt?t(o):F(o))}return 45===o||ie(o)?(e.consume(o),i+=String.fromCharCode(o),h):n(o)}function g(r){return 62===r?(e.consume(r),u.interrupt?t:F):n(r)}function m(t){return de(t)?(e.consume(t),m):C(t)}function y(t){return 47===t?(e.consume(t),C):58===t||95===t||le(t)?(e.consume(t),b):de(t)?(e.consume(t),y):C(t)}function b(t){return 45===t||46===t||58===t||95===t||ie(t)?(e.consume(t),b):k(t)}function k(t){return 61===t?(e.consume(t),x):de(t)?(e.consume(t),k):y(t)}function x(t){return null===t||60===t||61===t||62===t||96===t?n(t):34===t||39===t?(e.consume(t),a=t,v):de(t)?(e.consume(t),x):w(t)}function v(t){return t===a?(e.consume(t),a=null,S):null===t||fe(t)?n(t):(e.consume(t),v)}function w(t){return null===t||34===t||39===t||47===t||60===t||61===t||62===t||96===t||pe(t)?k(t):(e.consume(t),w)}function S(e){return 47===e||62===e||de(e)?y(e):n(e)}function C(t){return 62===t?(e.consume(t),E):n(t)}function E(t){return null===t||fe(t)?F(t):de(t)?(e.consume(t),E):n(t)}function F(t){return 45===t&&2===r?(e.consume(t),O):60===t&&1===r?(e.consume(t),L):62===t&&4===r?(e.consume(t),M):63===t&&3===r?(e.consume(t),z):93===t&&5===r?(e.consume(t),I):!fe(t)||6!==r&&7!==r?null===t||fe(t)?(e.exit("htmlFlowData"),A(t)):(e.consume(t),F):(e.exit("htmlFlowData"),e.check(Ge,R,A)(t))}function A(t){return e.check(et,D,R)(t)}function D(t){return e.enter("lineEnding"),e.consume(t),e.exit("lineEnding"),T}function T(t){return null===t||fe(t)?A(t):(e.enter("htmlFlowData"),F(t))}function O(t){return 45===t?(e.consume(t),z):F(t)}function L(t){return 47===t?(e.consume(t),i="",P):F(t)}function P(t){if(62===t){let n=i.toLowerCase();return Ze.includes(n)?(e.consume(t),M):F(t)}return le(t)&&i.length<8?(e.consume(t),i+=String.fromCharCode(t),P):F(t)}function I(t){return 93===t?(e.consume(t),z):F(t)}function z(t){return 62===t?(e.consume(t),M):45===t&&2===r?(e.consume(t),z):F(t)}function M(t){return null===t||fe(t)?(e.exit("htmlFlowData"),R(t)):(e.consume(t),M)}function R(n){return e.exit("htmlFlow"),t(n)}},resolveTo:function(e){let t=e.length;for(;t--&&("enter"!==e[t][0]||"htmlFlow"!==e[t][1].type););return t>1&&"linePrefix"===e[t-2][1].type&&(e[t][1].start=e[t-2][1].start,e[t+1][1].start=e[t-2][1].start,e.splice(t-2,2)),e},concrete:!0},Ge={tokenize:function(e,t,n){return function(r){return e.enter("lineEnding"),e.consume(r),e.exit("lineEnding"),e.attempt(Fe,t,n)}},partial:!0},et={tokenize:function(e,t,n){let r=this;return function(t){return fe(t)?(e.enter("lineEnding"),e.consume(t),e.exit("lineEnding"),l):n(t)};function l(e){return r.parser.lazy[r.now().line]?n(e):t(e)}},partial:!0};var tt={name:"htmlText",tokenize:function(e,t,n){let r,l,i,o=this;return function(t){return e.enter("htmlText"),e.enter("htmlTextData"),e.consume(t),a};function a(t){return 33===t?(e.consume(t),u):47===t?(e.consume(t),x):63===t?(e.consume(t),b):le(t)?(e.consume(t),S):n(t)}function u(t){return 45===t?(e.consume(t),s):91===t?(e.consume(t),l=0,d):le(t)?(e.consume(t),y):n(t)}function s(t){return 45===t?(e.consume(t),p):n(t)}function c(t){return null===t?n(t):45===t?(e.consume(t),f):fe(t)?(i=c,P(t)):(e.consume(t),c)}function f(t){return 45===t?(e.consume(t),p):c(t)}function p(e){return 62===e?L(e):45===e?f(e):c(e)}function d(t){let r="CDATA[";return t===r.charCodeAt(l++)?(e.consume(t),6===l?h:d):n(t)}function h(t){return null===t?n(t):93===t?(e.consume(t),g):fe(t)?(i=h,P(t)):(e.consume(t),h)}function g(t){return 93===t?(e.consume(t),m):h(t)}function m(t){return 62===t?L(t):93===t?(e.consume(t),m):h(t)}function y(t){return null===t||62===t?L(t):fe(t)?(i=y,P(t)):(e.consume(t),y)}function b(t){return null===t?n(t):63===t?(e.consume(t),k):fe(t)?(i=b,P(t)):(e.consume(t),b)}function k(e){return 62===e?L(e):b(e)}function x(t){return le(t)?(e.consume(t),v):n(t)}function v(t){return 45===t||ie(t)?(e.consume(t),v):w(t)}function w(t){return fe(t)?(i=w,P(t)):de(t)?(e.consume(t),w):L(t)}function S(t){return 45===t||ie(t)?(e.consume(t),S):47===t||62===t||pe(t)?C(t):n(t)}function C(t){return 47===t?(e.consume(t),L):58===t||95===t||le(t)?(e.consume(t),E):fe(t)?(i=C,P(t)):de(t)?(e.consume(t),C):L(t)}function E(t){return 45===t||46===t||58===t||95===t||ie(t)?(e.consume(t),E):F(t)}function F(t){return 61===t?(e.consume(t),A):fe(t)?(i=F,P(t)):de(t)?(e.consume(t),F):C(t)}function A(t){return null===t||60===t||61===t||62===t||96===t?n(t):34===t||39===t?(e.consume(t),r=t,D):fe(t)?(i=A,P(t)):de(t)?(e.consume(t),A):(e.consume(t),T)}function D(t){return t===r?(e.consume(t),r=void 0,O):null===t?n(t):fe(t)?(i=D,P(t)):(e.consume(t),D)}function T(t){return null===t||34===t||39===t||60===t||61===t||96===t?n(t):47===t||62===t||pe(t)?C(t):(e.consume(t),T)}function O(e){return 47===e||62===e||pe(e)?C(e):n(e)}function L(r){return 62===r?(e.consume(r),e.exit("htmlTextData"),e.exit("htmlText"),t):n(r)}function P(t){return e.exit("htmlTextData"),e.enter("lineEnding"),e.consume(t),e.exit("lineEnding"),I}function I(t){return de(t)?ye(e,z,"linePrefix",o.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(t):z(t)}function z(t){return e.enter("htmlTextData"),i(t)}}};var nt={name:"labelEnd",tokenize:function(e,t,n){let r,l,i=this,o=i.events.length;for(;o--;)if(("labelImage"===i.events[o][1].type||"labelLink"===i.events[o][1].type)&&!i.events[o][1]._balanced){r=i.events[o][1];break}return function(t){return r?r._inactive?c(t):(l=i.parser.defined.includes(We(i.sliceSerialize({start:r.end,end:i.now()}))),e.enter("labelEnd"),e.enter("labelMarker"),e.consume(t),e.exit("labelMarker"),e.exit("labelEnd"),a):n(t)};function a(t){return 40===t?e.attempt(rt,s,l?s:c)(t):91===t?e.attempt(lt,s,l?u:c)(t):l?s(t):c(t)}function u(t){return e.attempt(it,s,c)(t)}function s(e){return t(e)}function c(e){return r._balanced=!0,n(e)}},resolveTo:function(e,t){let n,r,l,i,o=e.length,a=0;for(;o--;)if(n=e[o][1],r){if("link"===n.type||"labelLink"===n.type&&n._inactive)break;"enter"===e[o][0]&&"labelLink"===n.type&&(n._inactive=!0)}else if(l){if("enter"===e[o][0]&&("labelImage"===n.type||"labelLink"===n.type)&&!n._balanced&&(r=o,"labelLink"!==n.type)){a=2;break}}else"labelEnd"===n.type&&(l=o);let u={type:"labelLink"===e[r][1].type?"link":"image",start:Object.assign({},e[r][1].start),end:Object.assign({},e[e.length-1][1].end)},s={type:"label",start:Object.assign({},e[r][1].start),end:Object.assign({},e[l][1].end)},c={type:"labelText",start:Object.assign({},e[r+a+2][1].end),end:Object.assign({},e[l-2][1].start)};return i=[["enter",u,t],["enter",s,t]],i=G(i,e.slice(r+1,r+a+3)),i=G(i,[["enter",c,t]]),i=G(i,we(t.parser.constructs.insideSpan.null,e.slice(r+a+4,l-3),t)),i=G(i,[["exit",c,t],e[l-2],e[l-1],["exit",s,t]]),i=G(i,e.slice(l+1)),i=G(i,[["exit",u,t]]),J(e,r,e.length,i),e},resolveAll:function(e){let t=-1;for(;++t<e.length;){let n=e[t][1];("labelImage"===n.type||"labelLink"===n.type||"labelEnd"===n.type)&&(e.splice(t+1,"labelImage"===n.type?4:2),n.type="data",t++)}return e}},rt={tokenize:function(e,t,n){return function(t){return e.enter("resource"),e.enter("resourceMarker"),e.consume(t),e.exit("resourceMarker"),r};function r(t){return pe(t)?Ve(e,l)(t):l(t)}function l(t){return 41===t?s(t):He(e,i,o,"resourceDestination","resourceDestinationLiteral","resourceDestinationLiteralMarker","resourceDestinationRaw","resourceDestinationString",32)(t)}function i(t){return pe(t)?Ve(e,a)(t):s(t)}function o(e){return n(e)}function a(t){return 34===t||39===t||40===t?qe(e,u,n,"resourceTitle","resourceTitleMarker","resourceTitleString")(t):s(t)}function u(t){return pe(t)?Ve(e,s)(t):s(t)}function s(r){return 41===r?(e.enter("resourceMarker"),e.consume(r),e.exit("resourceMarker"),e.exit("resource"),t):n(r)}}},lt={tokenize:function(e,t,n){let r=this;return function(t){return Ue.call(r,e,l,i,"reference","referenceMarker","referenceString")(t)};function l(e){return r.parser.defined.includes(We(r.sliceSerialize(r.events[r.events.length-1][1]).slice(1,-1)))?t(e):n(e)}function i(e){return n(e)}}},it={tokenize:function(e,t,n){return function(t){return e.enter("reference"),e.enter("referenceMarker"),e.consume(t),e.exit("referenceMarker"),r};function r(r){return 93===r?(e.enter("referenceMarker"),e.consume(r),e.exit("referenceMarker"),e.exit("reference"),t):n(r)}}};var ot={name:"labelStartImage",tokenize:function(e,t,n){let r=this;return function(t){return e.enter("labelImage"),e.enter("labelImageMarker"),e.consume(t),e.exit("labelImageMarker"),l};function l(t){return 91===t?(e.enter("labelMarker"),e.consume(t),e.exit("labelMarker"),e.exit("labelImage"),i):n(t)}function i(e){return 94===e&&"_hiddenFootnoteSupport"in r.parser.constructs?n(e):t(e)}},resolveAll:nt.resolveAll};var at={name:"labelStartLink",tokenize:function(e,t,n){let r=this;return function(t){return e.enter("labelLink"),e.enter("labelMarker"),e.consume(t),e.exit("labelMarker"),e.exit("labelLink"),l};function l(e){return 94===e&&"_hiddenFootnoteSupport"in r.parser.constructs?n(e):t(e)}},resolveAll:nt.resolveAll};var ut={name:"lineEnding",tokenize:function(e,t){return function(n){return e.enter("lineEnding"),e.consume(n),e.exit("lineEnding"),ye(e,t,"linePrefix")}}};var st={name:"thematicBreak",tokenize:function(e,t,n){let r,l=0;return function(t){return e.enter("thematicBreak"),function(e){return r=e,i(e)}(t)};function i(i){return i===r?(e.enter("thematicBreakSequence"),o(i)):l>=3&&(null===i||fe(i))?(e.exit("thematicBreak"),t(i)):n(i)}function o(t){return t===r?(e.consume(t),l++,o):(e.exit("thematicBreakSequence"),de(t)?ye(e,i,"whitespace")(t):i(t))}}};var ct={name:"list",tokenize:function(e,t,n){let r=this,l=r.events[r.events.length-1],i=l&&"linePrefix"===l[1].type?l[2].sliceSerialize(l[1],!0).length:0,o=0;return function(t){let l=r.containerState.type||(42===t||43===t||45===t?"listUnordered":"listOrdered");if("listUnordered"===l?!r.containerState.marker||t===r.containerState.marker:ue(t)){if(r.containerState.type||(r.containerState.type=l,e.enter(l,{_container:!0})),"listUnordered"===l)return e.enter("listItemPrefix"),42===t||45===t?e.check(st,n,u)(t):u(t);if(!r.interrupt||49===t)return e.enter("listItemPrefix"),e.enter("listItemValue"),a(t)}return n(t)};function a(t){return ue(t)&&++o<10?(e.consume(t),a):(!r.interrupt||o<2)&&(r.containerState.marker?t===r.containerState.marker:41===t||46===t)?(e.exit("listItemValue"),u(t)):n(t)}function u(t){return e.enter("listItemMarker"),e.consume(t),e.exit("listItemMarker"),r.containerState.marker=r.containerState.marker||t,e.check(Fe,r.interrupt?n:s,e.attempt(ft,f,c))}function s(e){return r.containerState.initialBlankLine=!0,i++,f(e)}function c(t){return de(t)?(e.enter("listItemPrefixWhitespace"),e.consume(t),e.exit("listItemPrefixWhitespace"),f):n(t)}function f(n){return r.containerState.size=i+r.sliceSerialize(e.exit("listItemPrefix"),!0).length,t(n)}},continuation:{tokenize:function(e,t,n){let r=this;return r.containerState._closeFlow=void 0,e.check(Fe,function(n){return r.containerState.furtherBlankLines=r.containerState.furtherBlankLines||r.containerState.initialBlankLine,ye(e,t,"listItemIndent",r.containerState.size+1)(n)},function(n){return r.containerState.furtherBlankLines||!de(n)?(r.containerState.furtherBlankLines=void 0,r.containerState.initialBlankLine=void 0,l(n)):(r.containerState.furtherBlankLines=void 0,r.containerState.initialBlankLine=void 0,e.attempt(pt,t,l)(n))});function l(l){return r.containerState._closeFlow=!0,r.interrupt=void 0,ye(e,e.attempt(ct,t,n),"linePrefix",r.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(l)}}},exit:function(e){e.exit(this.containerState.type)}},ft={tokenize:function(e,t,n){let r=this;return ye(e,function(e){let l=r.events[r.events.length-1];return!de(e)&&l&&"listItemPrefixWhitespace"===l[1].type?t(e):n(e)},"listItemPrefixWhitespace",r.parser.constructs.disable.null.includes("codeIndented")?void 0:5)},partial:!0},pt={tokenize:function(e,t,n){let r=this;return ye(e,function(e){let l=r.events[r.events.length-1];return l&&"listItemIndent"===l[1].type&&l[2].sliceSerialize(l[1],!0).length===r.containerState.size?t(e):n(e)},"listItemIndent",r.containerState.size+1)},partial:!0};var dt={name:"setextUnderline",tokenize:function(e,t,n){let r,l=this;return function(t){let o,a=l.events.length;for(;a--;)if("lineEnding"!==l.events[a][1].type&&"linePrefix"!==l.events[a][1].type&&"content"!==l.events[a][1].type){o="paragraph"===l.events[a][1].type;break}return l.parser.lazy[l.now().line]||!l.interrupt&&!o?n(t):(e.enter("setextHeadingLine"),r=t,function(t){return e.enter("setextHeadingLineSequence"),i(t)}(t))};function i(t){return t===r?(e.consume(t),i):(e.exit("setextHeadingLineSequence"),de(t)?ye(e,o,"lineSuffix")(t):o(t))}function o(r){return null===r||fe(r)?(e.exit("setextHeadingLine"),t(r)):n(r)}},resolveTo:function(e,t){let n,r,l,i=e.length;for(;i--;)if("enter"===e[i][0]){if("content"===e[i][1].type){n=i;break}"paragraph"===e[i][1].type&&(r=i)}else"content"===e[i][1].type&&e.splice(i,1),!l&&"definition"===e[i][1].type&&(l=i);let o={type:"setextHeading",start:Object.assign({},e[r][1].start),end:Object.assign({},e[e.length-1][1].end)};return e[r][1].type="setextHeadingText",l?(e.splice(r,0,["enter",o,t]),e.splice(l+1,0,["exit",e[n][1],t]),e[n][1].end=Object.assign({},e[l][1].end)):e[n][1]=o,e.push(["exit",o,t]),e}};var ht={tokenize:function(e){let t=this,n=e.attempt(Fe,function(r){if(null===r)return void e.consume(r);return e.enter("lineEndingBlank"),e.consume(r),e.exit("lineEndingBlank"),t.currentConstruct=void 0,n},e.attempt(this.parser.constructs.flowInitial,r,ye(e,e.attempt(this.parser.constructs.flow,r,e.attempt(Be,r)),"linePrefix")));return n;function r(r){if(null!==r)return e.enter("lineEnding"),e.consume(r),e.exit("lineEnding"),t.currentConstruct=void 0,n;e.consume(r)}}};var gt={resolveAll:kt()},mt=bt("string"),yt=bt("text");function bt(e){return{tokenize:function(t){let n=this,r=this.parser.constructs[e],l=t.attempt(r,i,o);return i;function i(e){return u(e)?l(e):o(e)}function o(e){if(null!==e)return t.enter("data"),t.consume(e),a;t.consume(e)}function a(e){return u(e)?(t.exit("data"),l(e)):(t.consume(e),a)}function u(e){if(null===e)return!0;let t=r[e],l=-1;if(t)for(;++l<t.length;){let e=t[l];if(!e.previous||e.previous.call(n,n.previous))return!0}return!1}},resolveAll:kt("text"===e?xt:void 0)}}function kt(e){return function(t,n){let r,l=-1;for(;++l<=t.length;)void 0===r?t[l]&&"data"===t[l][1].type&&(r=l,l++):(!t[l]||"data"!==t[l][1].type)&&(l!==r+2&&(t[r][1].end=t[l-1][1].end,t.splice(r+2,l-r-2),l=r+2),r=void 0);return e?e(t,n):t}}function xt(e,t){let n=0;for(;++n<=e.length;)if((n===e.length||"lineEnding"===e[n][1].type)&&"data"===e[n-1][1].type){let r,l=e[n-1][1],i=t.sliceStream(l),o=i.length,a=-1,u=0;for(;o--;){let e=i[o];if("string"==typeof e){for(a=e.length;32===e.charCodeAt(a-1);)u++,a--;if(a)break;a=-1}else if(-2===e)r=!0,u++;else if(-1!==e){o++;break}}if(u){let i={type:n===e.length||r||u<2?"lineSuffix":"hardBreakTrailing",start:{line:l.end.line,column:l.end.column-u,offset:l.end.offset-u,_index:l.start._index+o,_bufferIndex:o?a:l.start._bufferIndex+a},end:Object.assign({},l.end)};l.end=Object.assign({},i.start),l.start.offset===l.end.offset?Object.assign(l,i):(e.splice(n,0,["enter",i,t],["exit",i,t]),n+=2)}n++}return e}function vt(e,t,n){let r=Object.assign(n?Object.assign({},n):{line:1,column:1,offset:0},{_index:0,_bufferIndex:-1}),l={},i=[],o=[],a=[],u={consume:function(e){fe(e)?(r.line++,r.column=1,r.offset+=-3===e?2:1,y()):-1!==e&&(r.column++,r.offset++),r._bufferIndex<0?r._index++:(r._bufferIndex++,r._bufferIndex===o[r._index].length&&(r._bufferIndex=-1,r._index++)),s.previous=e},enter:function(e,t){let n=t||{};return n.type=e,n.start=p(),s.events.push(["enter",n,s]),a.push(n),n},exit:function(e){let t=a.pop();return t.end=p(),s.events.push(["exit",t,s]),t},attempt:g(function(e,t){m(e,t.from)}),check:g(h),interrupt:g(h,{interrupt:!0})},s={previous:null,code:null,containerState:{},events:[],parser:e,sliceStream:f,sliceSerialize:function(e,t){return function(e,t){let n,r=-1,l=[];for(;++r<e.length;){let i,o=e[r];if("string"==typeof o)i=o;else switch(o){case-5:i="\r";break;case-4:i="\n";break;case-3:i="\r\n";break;case-2:i=t?" ":"\t";break;case-1:if(!t&&n)continue;i=" ";break;default:i=String.fromCharCode(o)}n=-2===o,l.push(i)}return l.join("")}(f(e),t)},now:p,defineSkip:function(e){l[e.line]=e.column,y()},write:function(e){return o=G(o,e),function(){let e;for(;r._index<o.length;){let t=o[r._index];if("string"==typeof t)for(e=r._index,r._bufferIndex<0&&(r._bufferIndex=0);r._index===e&&r._bufferIndex<t.length;)d(t.charCodeAt(r._bufferIndex));else d(t)}}(),null!==o[o.length-1]?[]:(m(t,0),s.events=we(i,s.events,s),s.events)}},c=t.tokenize.call(s,u);return t.resolveAll&&i.push(t),s;function f(e){return function(e,t){let n,r=t.start._index,l=t.start._bufferIndex,i=t.end._index,o=t.end._bufferIndex;if(r===i)n=[e[r].slice(l,o)];else{if(n=e.slice(r,i),l>-1){let e=n[0];"string"==typeof e?n[0]=e.slice(l):n.shift()}o>0&&n.push(e[i].slice(0,o))}return n}(o,e)}function p(){let{line:e,column:t,offset:n,_index:l,_bufferIndex:i}=r;return{line:e,column:t,offset:n,_index:l,_bufferIndex:i}}function d(e){c=c(e)}function h(e,t){t.restore()}function g(e,t){return function(n,l,i){let o,c,f,d;return Array.isArray(n)?h(n):"tokenize"in n?h([n]):function(e){return t;function t(t){let n=null!==t&&e[t],r=null!==t&&e.null;return h([...Array.isArray(n)?n:n?[n]:[],...Array.isArray(r)?r:r?[r]:[]])(t)}}(n);function h(e){return o=e,c=0,0===e.length?i:g(e[c])}function g(e){return function(n){return d=function(){let e=p(),t=s.previous,n=s.currentConstruct,l=s.events.length,i=Array.from(a);return{restore:o,from:l};function o(){r=e,s.previous=t,s.currentConstruct=n,s.events.length=l,a=i,y()}}(),f=e,e.partial||(s.currentConstruct=e),e.name&&s.parser.constructs.disable.null.includes(e.name)?b():e.tokenize.call(t?Object.assign(Object.create(s),t):s,u,m,b)(n)}}function m(t){return e(f,d),l}function b(e){return d.restore(),++c<o.length?g(o[c]):i}}}function m(e,t){e.resolveAll&&!i.includes(e)&&i.push(e),e.resolve&&J(s.events,t,s.events.length-t,e.resolve(s.events.slice(t),s)),e.resolveTo&&(s.events=e.resolveTo(s.events,s))}function y(){r.line in l&&r.column<2&&(r.column=l[r.line],r.offset+=l[r.line]-1)}}var wt={};a(wt,{attentionMarkers:()=>Ot,contentInitial:()=>Ct,disable:()=>Lt,document:()=>St,flow:()=>Ft,flowInitial:()=>Et,insideSpan:()=>Tt,string:()=>At,text:()=>Dt});var St={42:ct,43:ct,45:ct,48:ct,49:ct,50:ct,51:ct,52:ct,53:ct,54:ct,55:ct,56:ct,57:ct,62:Ae},Ct={91:$e},Et={[-2]:ze,[-1]:ze,32:ze},Ft={35:Ke,42:st,45:[dt,st],60:Je,61:dt,95:st,96:Ie,126:Ie},At={38:Le,92:De},Dt={[-5]:ut,[-4]:ut,[-3]:ut,33:ot,38:Le,42:Se,60:[Ee,tt],91:at,92:[Ye,De],93:nt,95:Se,96:Re},Tt={null:[Se,gt]},Ot={null:[42,95]},Lt={null:[]};var Pt=/[\0\t\n\r]/g;function It(e,t){let n=Number.parseInt(e,t);return n<9||11===n||n>13&&n<32||n>126&&n<160||n>55295&&n<57344||n>64975&&n<65008||!(65535&~n)||65534==(65535&n)||n>1114111?"�":String.fromCharCode(n)}var zt=/\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;function Mt(e){return e.replace(zt,Rt)}function Rt(e,t,n){if(t)return t;if(35===n.charCodeAt(0)){let e=n.charCodeAt(1),t=120===e||88===e;return It(n.slice(t?2:1),t?16:10)}return Oe(n)||e}var jt={}.hasOwnProperty,_t=function(e,t,n){return"string"!=typeof t&&(n=t,t=void 0),function(e){let t={transforms:[],canContainEols:["emphasis","fragment","heading","paragraph","strong"],enter:{autolink:a(ie),autolinkProtocol:D,autolinkEmail:D,atxHeading:a(te),blockQuote:a(Y),characterEscape:D,characterReference:D,codeFenced:a(Z),codeFencedFenceInfo:u,codeFencedFenceMeta:u,codeIndented:a(Z,u),codeText:a(J,u),codeTextData:D,data:D,codeFlowValue:D,definition:a(G),definitionDestinationString:u,definitionLabelString:u,definitionTitleString:u,emphasis:a(ee),hardBreakEscape:a(ne),hardBreakTrailing:a(ne),htmlFlow:a(re,u),htmlFlowData:D,htmlText:a(re,u),htmlTextData:D,image:a(le),label:u,link:a(ie),listItem:a(ae),listItemValue:h,listOrdered:a(oe,d),listUnordered:a(oe),paragraph:a(ue),reference:U,referenceString:u,resourceDestinationString:u,resourceTitleString:u,setextHeading:a(te),strong:a(se),thematicBreak:a(fe)},exit:{atxHeading:c(),atxHeadingSequence:C,autolink:c(),autolinkEmail:Q,autolinkProtocol:$,blockQuote:c(),characterEscapeValue:T,characterReferenceMarkerHexadecimal:V,characterReferenceMarkerNumeric:V,characterReferenceValue:W,codeFenced:c(b),codeFencedFence:y,codeFencedFenceInfo:g,codeFencedFenceMeta:m,codeFlowValue:T,codeIndented:c(k),codeText:c(z),codeTextData:T,data:T,definition:c(),definitionDestinationString:S,definitionLabelString:v,definitionTitleString:w,emphasis:c(),hardBreakEscape:c(L),hardBreakTrailing:c(L),htmlFlow:c(P),htmlFlowData:T,htmlText:c(I),htmlTextData:T,image:c(R),label:_,labelText:j,lineEnding:O,link:c(M),listItem:c(),listOrdered:c(),listUnordered:c(),paragraph:c(),referenceString:q,resourceDestinationString:B,resourceTitleString:N,resource:H,setextHeading:c(A),setextHeadingLineSequence:F,setextHeadingText:E,strong:c(),thematicBreak:c()}};Nt(t,(e||{}).mdastExtensions||[]);let n={};return r;function r(e){let n={type:"root",children:[]},r={stack:[n],tokenStack:[],config:t,enter:s,exit:f,buffer:u,resume:p,setData:i,getData:o},a=[],c=-1;for(;++c<e.length;)if("listOrdered"===e[c][1].type||"listUnordered"===e[c][1].type)if("enter"===e[c][0])a.push(c);else{c=l(e,a.pop(),c)}for(c=-1;++c<e.length;){let n=t[e[c][0]];jt.call(n,e[c][1].type)&&n[e[c][1].type].call(Object.assign({sliceSerialize:e[c][2].sliceSerialize},r),e[c][1])}if(r.tokenStack.length>0){let e=r.tokenStack[r.tokenStack.length-1];(e[1]||Ut).call(r,void 0,e[0])}for(n.position={start:Bt(e.length>0?e[0][1].start:{line:1,column:1,offset:0}),end:Bt(e.length>0?e[e.length-2][1].end:{line:1,column:1,offset:0})},c=-1;++c<t.transforms.length;)n=t.transforms[c](n)||n;return n}function l(e,t,n){let r,l,i,o,a=t-1,u=-1,s=!1;for(;++a<=n;){let t=e[a];if("listUnordered"===t[1].type||"listOrdered"===t[1].type||"blockQuote"===t[1].type?("enter"===t[0]?u++:u--,o=void 0):"lineEndingBlank"===t[1].type?"enter"===t[0]&&(r&&!o&&!u&&!i&&(i=a),o=void 0):"linePrefix"===t[1].type||"listItemValue"===t[1].type||"listItemMarker"===t[1].type||"listItemPrefix"===t[1].type||"listItemPrefixWhitespace"===t[1].type||(o=void 0),!u&&"enter"===t[0]&&"listItemPrefix"===t[1].type||-1===u&&"exit"===t[0]&&("listUnordered"===t[1].type||"listOrdered"===t[1].type)){if(r){let o=a;for(l=void 0;o--;){let t=e[o];if("lineEnding"===t[1].type||"lineEndingBlank"===t[1].type){if("exit"===t[0])continue;l&&(e[l][1].type="lineEndingBlank",s=!0),t[1].type="lineEnding",l=o}else if("linePrefix"!==t[1].type&&"blockQuotePrefix"!==t[1].type&&"blockQuotePrefixWhitespace"!==t[1].type&&"blockQuoteMarker"!==t[1].type&&"listItemIndent"!==t[1].type)break}i&&(!l||i<l)&&(r._spread=!0),r.end=Object.assign({},l?e[l][1].start:t[1].end),e.splice(l||a,0,["exit",r,t[2]]),a++,n++}"listItemPrefix"===t[1].type&&(r={type:"listItem",_spread:!1,start:Object.assign({},t[1].start),end:void 0},e.splice(a,0,["enter",r,t[2]]),a++,n++,i=void 0,o=!0)}}return e[t][1]._spread=s,n}function i(e,t){n[e]=t}function o(e){return n[e]}function a(e,t){return n;function n(n){s.call(this,e(n),n),t&&t.call(this,n)}}function u(){this.stack.push({type:"fragment",children:[]})}function s(e,t,n){return this.stack[this.stack.length-1].children.push(e),this.stack.push(e),this.tokenStack.push([t,n]),e.position={start:Bt(t.start)},e}function c(e){return t;function t(t){e&&e.call(this,t),f.call(this,t)}}function f(e,t){let n=this.stack.pop(),r=this.tokenStack.pop();if(!r)throw new Error("Cannot close `"+e.type+"` ("+x({start:e.start,end:e.end})+"): it’s not open");return r[0].type!==e.type&&(t?t.call(this,e,r[0]):(r[1]||Ut).call(this,e,r[0])),n.position.end=Bt(e.end),n}function p(){return function(e){return X(e,"boolean"!=typeof K.includeImageAlt||K.includeImageAlt,"boolean"!=typeof K.includeHtml||K.includeHtml)}(this.stack.pop())}function d(){i("expectingFirstListItemValue",!0)}function h(e){if(o("expectingFirstListItemValue")){this.stack[this.stack.length-2].start=Number.parseInt(this.sliceSerialize(e),10),i("expectingFirstListItemValue")}}function g(){let e=this.resume();this.stack[this.stack.length-1].lang=e}function m(){let e=this.resume();this.stack[this.stack.length-1].meta=e}function y(){o("flowCodeInside")||(this.buffer(),i("flowCodeInside",!0))}function b(){let e=this.resume();this.stack[this.stack.length-1].value=e.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g,""),i("flowCodeInside")}function k(){let e=this.resume();this.stack[this.stack.length-1].value=e.replace(/(\r?\n|\r)$/g,"")}function v(e){let t=this.resume(),n=this.stack[this.stack.length-1];n.label=t,n.identifier=We(this.sliceSerialize(e)).toLowerCase()}function w(){let e=this.resume();this.stack[this.stack.length-1].title=e}function S(){let e=this.resume();this.stack[this.stack.length-1].url=e}function C(e){let t=this.stack[this.stack.length-1];if(!t.depth){let n=this.sliceSerialize(e).length;t.depth=n}}function E(){i("setextHeadingSlurpLineEnding",!0)}function F(e){this.stack[this.stack.length-1].depth=61===this.sliceSerialize(e).charCodeAt(0)?1:2}function A(){i("setextHeadingSlurpLineEnding")}function D(e){let t=this.stack[this.stack.length-1],n=t.children[t.children.length-1];(!n||"text"!==n.type)&&(n=ce(),n.position={start:Bt(e.start)},t.children.push(n)),this.stack.push(n)}function T(e){let t=this.stack.pop();t.value+=this.sliceSerialize(e),t.position.end=Bt(e.end)}function O(e){let n=this.stack[this.stack.length-1];if(o("atHardBreak")){return n.children[n.children.length-1].position.end=Bt(e.end),void i("atHardBreak")}!o("setextHeadingSlurpLineEnding")&&t.canContainEols.includes(n.type)&&(D.call(this,e),T.call(this,e))}function L(){i("atHardBreak",!0)}function P(){let e=this.resume();this.stack[this.stack.length-1].value=e}function I(){let e=this.resume();this.stack[this.stack.length-1].value=e}function z(){let e=this.resume();this.stack[this.stack.length-1].value=e}function M(){let e=this.stack[this.stack.length-1];if(o("inReference")){let t=o("referenceType")||"shortcut";e.type+="Reference",e.referenceType=t,delete e.url,delete e.title}else delete e.identifier,delete e.label;i("referenceType")}function R(){let e=this.stack[this.stack.length-1];if(o("inReference")){let t=o("referenceType")||"shortcut";e.type+="Reference",e.referenceType=t,delete e.url,delete e.title}else delete e.identifier,delete e.label;i("referenceType")}function j(e){let t=this.sliceSerialize(e),n=this.stack[this.stack.length-2];n.label=Mt(t),n.identifier=We(t).toLowerCase()}function _(){let e=this.stack[this.stack.length-1],t=this.resume(),n=this.stack[this.stack.length-1];if(i("inReference",!0),"link"===n.type){let t=e.children;n.children=t}else n.alt=t}function B(){let e=this.resume();this.stack[this.stack.length-1].url=e}function N(){let e=this.resume();this.stack[this.stack.length-1].title=e}function H(){i("inReference")}function U(){i("referenceType","collapsed")}function q(e){let t=this.resume(),n=this.stack[this.stack.length-1];n.label=t,n.identifier=We(this.sliceSerialize(e)).toLowerCase(),i("referenceType","full")}function V(e){i("characterReferenceType",e.type)}function W(e){let t,n=this.sliceSerialize(e),r=o("characterReferenceType");r?(t=It(n,"characterReferenceMarkerNumeric"===r?10:16),i("characterReferenceType")):t=Oe(n);let l=this.stack.pop();l.value+=t,l.position.end=Bt(e.end)}function $(e){T.call(this,e),this.stack[this.stack.length-1].url=this.sliceSerialize(e)}function Q(e){T.call(this,e),this.stack[this.stack.length-1].url="mailto:"+this.sliceSerialize(e)}function Y(){return{type:"blockquote",children:[]}}function Z(){return{type:"code",lang:null,meta:null,value:""}}function J(){return{type:"inlineCode",value:""}}function G(){return{type:"definition",identifier:"",label:null,title:null,url:""}}function ee(){return{type:"emphasis",children:[]}}function te(){return{type:"heading",depth:void 0,children:[]}}function ne(){return{type:"break"}}function re(){return{type:"html",value:""}}function le(){return{type:"image",title:null,url:"",alt:null}}function ie(){return{type:"link",title:null,url:"",children:[]}}function oe(e){return{type:"list",ordered:"listOrdered"===e.type,start:null,spread:e._spread,children:[]}}function ae(e){return{type:"listItem",spread:e._spread,checked:null,children:[]}}function ue(){return{type:"paragraph",children:[]}}function se(){return{type:"strong",children:[]}}function ce(){return{type:"text",value:""}}function fe(){return{type:"thematicBreak"}}}(n)(function(e){for(;!je(e););return e}(function(e){let t={defined:[],lazy:{},constructs:te([wt,...(e||{}).extensions||[]]),content:n(be),document:n(ke),flow:n(ht),string:n(mt),text:n(yt)};return t;function n(e){return function(n){return vt(t,e,n)}}}(n).document().write(function(){let e,t=1,n="",r=!0;return function(l,i,o){let a,u,s,c,f,p=[];for(l=n+l.toString(i),s=0,n="",r&&(65279===l.charCodeAt(0)&&s++,r=void 0);s<l.length;){if(Pt.lastIndex=s,a=Pt.exec(l),c=a&&void 0!==a.index?a.index:l.length,f=l.charCodeAt(c),!a){n=l.slice(s);break}if(10===f&&s===c&&e)p.push(-3),e=void 0;else switch(e&&(p.push(-5),e=void 0),s<c&&(p.push(l.slice(s,c)),t+=c-s),f){case 0:p.push(65533),t++;break;case 9:for(u=4*Math.ceil(t/4),p.push(-2);t++<u;)p.push(-1);break;case 10:p.push(-4),t=1;break;default:e=!0,t=1}s=c+1}return o&&(e&&p.push(-5),n&&p.push(n),p.push(null)),p}}()(e,t,!0))))};function Bt(e){return{line:e.line,column:e.column,offset:e.offset}}function Nt(e,t){let n=-1;for(;++n<t.length;){let r=t[n];Array.isArray(r)?Nt(e,r):Ht(e,r)}}function Ht(e,t){let n;for(n in t)if(jt.call(t,n))if("canContainEols"===n){let r=t[n];r&&e[n].push(...r)}else if("transforms"===n){let r=t[n];r&&e[n].push(...r)}else if("enter"===n||"exit"===n){let r=t[n];r&&Object.assign(e[n],r)}}function Ut(e,t){throw e?new Error("Cannot close `"+e.type+"` ("+x({start:e.start,end:e.end})+"): a different token (`"+t.type+"`, "+x({start:t.start,end:t.end})+") is open"):new Error("Cannot close document, a token (`"+t.type+"`, "+x({start:t.start,end:t.end})+") is still open")}function qt(e){Object.assign(this,{Parser:t=>{let n=this.data("settings");return _t(t,Object.assign({},n,e,{extensions:this.data("micromarkExtensions")||[],mdastExtensions:this.data("fromMarkdownExtensions")||[]}))}})}function Vt(e){let t=[],n=-1,r=0,l=0;for(;++n<e.length;){let i=e.charCodeAt(n),o="";if(37===i&&ie(e.charCodeAt(n+1))&&ie(e.charCodeAt(n+2)))l=2;else if(i<128)/[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(i))||(o=String.fromCharCode(i));else if(i>55295&&i<57344){let t=e.charCodeAt(n+1);i<56320&&t>56319&&t<57344?(o=String.fromCharCode(i,t),l=1):o="�"}else o=String.fromCharCode(i);o&&(t.push(e.slice(r,n),encodeURIComponent(o)),r=n+l+1,o=""),l&&(n+=l,l=0)}return t.join("")+e.slice(r)}function Wt(e,t){let n,r=String(t.identifier).toUpperCase(),l=Vt(r.toLowerCase()),i=e.footnoteOrder.indexOf(r);-1===i?(e.footnoteOrder.push(r),e.footnoteCounts[r]=1,n=e.footnoteOrder.length):(e.footnoteCounts[r]++,n=i+1);let o=e.footnoteCounts[r],a={type:"element",tagName:"a",properties:{href:"#"+e.clobberPrefix+"fn-"+l,id:e.clobberPrefix+"fnref-"+l+(o>1?"-"+o:""),dataFootnoteRef:!0,ariaDescribedBy:["footnote-label"]},children:[{type:"text",value:String(n)}]};e.patch(t,a);let u={type:"element",tagName:"sup",properties:{},children:[a]};return e.patch(t,u),e.applyData(t,u)}function $t(e,t){let n=t.referenceType,r="]";if("collapsed"===n?r+="[]":"full"===n&&(r+="["+(t.label||t.identifier)+"]"),"imageReference"===t.type)return{type:"text",value:"!["+t.alt+r};let l=e.all(t),i=l[0];i&&"text"===i.type?i.value="["+i.value:l.unshift({type:"text",value:"["});let o=l[l.length-1];return o&&"text"===o.type?o.value+=r:l.push({type:"text",value:r}),l}function Qt(e){let t=e.spread;return null==t?e.children.length>1:t}var Yt=Xt("start"),Kt=Xt("end");function Xt(e){return function(t){let n=t&&t.position&&t.position[e]||{};return{line:n.line||null,column:n.column||null,offset:n.offset>-1?n.offset:null}}}function Zt(e){let t=String(e),n=/\r?\n|\r/g,r=n.exec(t),l=0,i=[];for(;r;)i.push(Jt(t.slice(l,r.index),l>0,!0),r[0]),l=r.index+r[0].length,r=n.exec(t);return i.push(Jt(t.slice(l),l>0,!1)),i.join("")}function Jt(e,t,n){let r=0,l=e.length;if(t){let t=e.codePointAt(r);for(;9===t||32===t;)r++,t=e.codePointAt(r)}if(n){let t=e.codePointAt(l-1);for(;9===t||32===t;)l--,t=e.codePointAt(l-1)}return l>r?e.slice(r,l):""}var Gt={blockquote:function(e,t){let n={type:"element",tagName:"blockquote",properties:{},children:e.wrap(e.all(t),!0)};return e.patch(t,n),e.applyData(t,n)},break:function(e,t){let n={type:"element",tagName:"br",properties:{},children:[]};return e.patch(t,n),[e.applyData(t,n),{type:"text",value:"\n"}]},code:function(e,t){let n=t.value?t.value+"\n":"",r=t.lang?t.lang.match(/^[^ \t]+(?=[ \t]|$)/):null,l={};r&&(l.className=["language-"+r]);let i={type:"element",tagName:"code",properties:l,children:[{type:"text",value:n}]};return t.meta&&(i.data={meta:t.meta}),e.patch(t,i),i=e.applyData(t,i),i={type:"element",tagName:"pre",properties:{},children:[i]},e.patch(t,i),i},delete:function(e,t){let n={type:"element",tagName:"del",properties:{},children:e.all(t)};return e.patch(t,n),e.applyData(t,n)},emphasis:function(e,t){let n={type:"element",tagName:"em",properties:{},children:e.all(t)};return e.patch(t,n),e.applyData(t,n)},footnoteReference:Wt,footnote:function(e,t){let n=e.footnoteById,r=1;for(;r in n;)r++;let l=String(r);return n[l]={type:"footnoteDefinition",identifier:l,children:[{type:"paragraph",children:t.children}],position:t.position},Wt(e,{type:"footnoteReference",identifier:l,position:t.position})},heading:function(e,t){let n={type:"element",tagName:"h"+t.depth,properties:{},children:e.all(t)};return e.patch(t,n),e.applyData(t,n)},html:function(e,t){if(e.dangerous){let n={type:"raw",value:t.value};return e.patch(t,n),e.applyData(t,n)}return null},imageReference:function(e,t){let n=e.definition(t.identifier);if(!n)return $t(e,t);let r={src:Vt(n.url||""),alt:t.alt};null!==n.title&&void 0!==n.title&&(r.title=n.title);let l={type:"element",tagName:"img",properties:r,children:[]};return e.patch(t,l),e.applyData(t,l)},image:function(e,t){let n={src:Vt(t.url)};null!==t.alt&&void 0!==t.alt&&(n.alt=t.alt),null!==t.title&&void 0!==t.title&&(n.title=t.title);let r={type:"element",tagName:"img",properties:n,children:[]};return e.patch(t,r),e.applyData(t,r)},inlineCode:function(e,t){let n={type:"text",value:t.value.replace(/\r?\n|\r/g," ")};e.patch(t,n);let r={type:"element",tagName:"code",properties:{},children:[n]};return e.patch(t,r),e.applyData(t,r)},linkReference:function(e,t){let n=e.definition(t.identifier);if(!n)return $t(e,t);let r={href:Vt(n.url||"")};null!==n.title&&void 0!==n.title&&(r.title=n.title);let l={type:"element",tagName:"a",properties:r,children:e.all(t)};return e.patch(t,l),e.applyData(t,l)},link:function(e,t){let n={href:Vt(t.url)};null!==t.title&&void 0!==t.title&&(n.title=t.title);let r={type:"element",tagName:"a",properties:n,children:e.all(t)};return e.patch(t,r),e.applyData(t,r)},listItem:function(e,t,n){let r=e.all(t),l=n?function(e){let t=!1;if("list"===e.type){t=e.spread||!1;let n=e.children,r=-1;for(;!t&&++r<n.length;)t=Qt(n[r])}return t}(n):Qt(t),i={},o=[];if("boolean"==typeof t.checked){let e,n=r[0];n&&"element"===n.type&&"p"===n.tagName?e=n:(e={type:"element",tagName:"p",properties:{},children:[]},r.unshift(e)),e.children.length>0&&e.children.unshift({type:"text",value:" "}),e.children.unshift({type:"element",tagName:"input",properties:{type:"checkbox",checked:t.checked,disabled:!0},children:[]}),i.className=["task-list-item"]}let a=-1;for(;++a<r.length;){let e=r[a];(l||0!==a||"element"!==e.type||"p"!==e.tagName)&&o.push({type:"text",value:"\n"}),"element"!==e.type||"p"!==e.tagName||l?o.push(e):o.push(...e.children)}let u=r[r.length-1];u&&(l||"element"!==u.type||"p"!==u.tagName)&&o.push({type:"text",value:"\n"});let s={type:"element",tagName:"li",properties:i,children:o};return e.patch(t,s),e.applyData(t,s)},list:function(e,t){let n={},r=e.all(t),l=-1;for("number"==typeof t.start&&1!==t.start&&(n.start=t.start);++l<r.length;){let e=r[l];if("element"===e.type&&"li"===e.tagName&&e.properties&&Array.isArray(e.properties.className)&&e.properties.className.includes("task-list-item")){n.className=["contains-task-list"];break}}let i={type:"element",tagName:t.ordered?"ol":"ul",properties:n,children:e.wrap(r,!0)};return e.patch(t,i),e.applyData(t,i)},paragraph:function(e,t){let n={type:"element",tagName:"p",properties:{},children:e.all(t)};return e.patch(t,n),e.applyData(t,n)},root:function(e,t){let n={type:"root",children:e.wrap(e.all(t))};return e.patch(t,n),e.applyData(t,n)},strong:function(e,t){let n={type:"element",tagName:"strong",properties:{},children:e.all(t)};return e.patch(t,n),e.applyData(t,n)},table:function(e,t){let n=e.all(t),r=n.shift(),l=[];if(r){let n={type:"element",tagName:"thead",properties:{},children:e.wrap([r],!0)};e.patch(t.children[0],n),l.push(n)}if(n.length>0){let r={type:"element",tagName:"tbody",properties:{},children:e.wrap(n,!0)},i=Yt(t.children[1]),o=Kt(t.children[t.children.length-1]);i.line&&o.line&&(r.position={start:i,end:o}),l.push(r)}let i={type:"element",tagName:"table",properties:{},children:e.wrap(l,!0)};return e.patch(t,i),e.applyData(t,i)},tableCell:function(e,t){let n={type:"element",tagName:"td",properties:{},children:e.all(t)};return e.patch(t,n),e.applyData(t,n)},tableRow:function(e,t,n){let r=n?n.children:void 0,l=0===(r?r.indexOf(t):1)?"th":"td",i=n&&"table"===n.type?n.align:void 0,o=i?i.length:t.children.length,a=-1,u=[];for(;++a<o;){let n=t.children[a],r={},o=i?i[a]:void 0;o&&(r.align=o);let s={type:"element",tagName:l,properties:r,children:[]};n&&(s.children=e.all(n),e.patch(n,s),s=e.applyData(t,s)),u.push(s)}let s={type:"element",tagName:"tr",properties:{},children:e.wrap(u,!0)};return e.patch(t,s),e.applyData(t,s)},text:function(e,t){let n={type:"text",value:Zt(String(t.value))};return e.patch(t,n),e.applyData(t,n)},thematicBreak:function(e,t){let n={type:"element",tagName:"hr",properties:{},children:[]};return e.patch(t,n),e.applyData(t,n)},toml:en,yaml:en,definition:en,footnoteDefinition:en};function en(){return null}var tn=function(e){if(null==e)return rn;if("string"==typeof e)return function(e){return nn(t);function t(t){return t&&t.type===e}}(e);if("object"==typeof e)return Array.isArray(e)?function(e){let t=[],n=-1;for(;++n<e.length;)t[n]=tn(e[n]);return nn(r);function r(...e){let n=-1;for(;++n<t.length;)if(t[n].call(this,...e))return!0;return!1}}(e):function(e){return nn(t);function t(t){let n;for(n in e)if(t[n]!==e[n])return!1;return!0}}(e);if("function"==typeof e)return nn(e);throw new Error("Expected function, string, or object as test")};function nn(e){return function(t,...n){return!!(t&&"object"==typeof t&&"type"in t&&e.call(this,t,...n))}}function rn(){return!0}var ln=!0,on=!1,an=function(e,t,n,r){"function"==typeof t&&"function"!=typeof n&&(r=n,n=t,t=null);let l=tn(t),i=r?-1:1;!function e(o,a,u){let s=o&&"object"==typeof o?o:{};if("string"==typeof s.type){let e="string"==typeof s.tagName?s.tagName:"string"==typeof s.name?s.name:void 0;Object.defineProperty(c,"name",{value:"node ("+o.type+(e?"<"+e+">":"")+")"})}return c;function c(){let s,c,f,p=[];if((!t||l(o,a,u[u.length-1]||null))&&(p=function(e){return Array.isArray(e)?e:"number"==typeof e?[ln,e]:[e]}(n(o,u)),p[0]===on))return p;if(o.children&&"skip"!==p[0])for(c=(r?o.children.length:-1)+i,f=u.concat(o);c>-1&&c<o.children.length;){if(s=e(o.children[c],c,f)(),s[0]===on)return s;c="number"==typeof s[1]?s[1]:c+i}return p}}(e,void 0,[])()};var un=function(e,t,n,r){"function"==typeof t&&"function"!=typeof n&&(r=n,n=t,t=null),an(e,t,function(e,t){let r=t[t.length-1];return n(e,r?r.children.indexOf(e):null,r)},r)};var sn={}.hasOwnProperty;function cn(e){return String(e||"").toUpperCase()}var fn={}.hasOwnProperty;function pn(e,t){let n=t||{},r=n.allowDangerousHtml||!1,i={};return a.dangerous=r,a.clobberPrefix=void 0===n.clobberPrefix||null===n.clobberPrefix?"user-content-":n.clobberPrefix,a.footnoteLabel=n.footnoteLabel||"Footnotes",a.footnoteLabelTagName=n.footnoteLabelTagName||"h2",a.footnoteLabelProperties=n.footnoteLabelProperties||{className:["sr-only"]},a.footnoteBackLabel=n.footnoteBackLabel||"Back to content",a.unknownHandler=n.unknownHandler,a.passThrough=n.passThrough,a.handlers=l(l({},Gt),n.handlers),a.definition=function(e){let t=Object.create(null);if(!e||!e.type)throw new Error("mdast-util-definitions expected node");return un(e,"definition",e=>{let n=cn(e.identifier);n&&!sn.call(t,n)&&(t[n]=e)}),function(e){let n=cn(e);return n&&sn.call(t,n)?t[n]:null}}(e),a.footnoteById=i,a.footnoteOrder=[],a.footnoteCounts={},a.patch=dn,a.applyData=hn,a.one=function(e,t){return gn(a,e,t)},a.all=function(e){return mn(a,e)},a.wrap=yn,a.augment=o,un(e,"footnoteDefinition",e=>{let t=String(e.identifier).toUpperCase();fn.call(i,t)||(i[t]=e)}),a;function o(e,t){if(e&&"data"in e&&e.data){let n=e.data;n.hName&&("element"!==t.type&&(t={type:"element",tagName:"",properties:{},children:[]}),t.tagName=n.hName),"element"===t.type&&n.hProperties&&(t.properties=l(l({},t.properties),n.hProperties)),"children"in t&&t.children&&n.hChildren&&(t.children=n.hChildren)}if(e){let n="type"in e?e:{position:e};(function(e){return!(e&&e.position&&e.position.start&&e.position.start.line&&e.position.start.column&&e.position.end&&e.position.end.line&&e.position.end.column)})(n)||(t.position={start:Yt(n),end:Kt(n)})}return t}function a(e,t,n,r){return Array.isArray(n)&&(r=n,n={}),o(e,{type:"element",tagName:t,properties:n||{},children:r||[]})}}function dn(e,t){e.position&&(t.position=function(e){return{start:Yt(e),end:Kt(e)}}(e))}function hn(e,t){let n=t;if(e&&e.data){let t=e.data.hName,r=e.data.hChildren,i=e.data.hProperties;"string"==typeof t&&("element"===n.type?n.tagName=t:n={type:"element",tagName:t,properties:{},children:[]}),"element"===n.type&&i&&(n.properties=l(l({},n.properties),i)),"children"in n&&n.children&&null!=r&&(n.children=r)}return n}function gn(e,t,n){let i=t&&t.type;if(!i)throw new Error("Expected node, got `"+t+"`");return fn.call(e.handlers,i)?e.handlers[i](e,t,n):e.passThrough&&e.passThrough.includes(i)?"children"in t?r(l({},t),{children:mn(e,t)}):t:e.unknownHandler?e.unknownHandler(e,t,n):function(e,t){let n=t.data||{},r=!("value"in t)||fn.call(n,"hProperties")||fn.call(n,"hChildren")?{type:"element",tagName:"div",properties:{},children:mn(e,t)}:{type:"text",value:t.value};return e.patch(t,r),e.applyData(t,r)}(e,t)}function mn(e,t){let n=[];if("children"in t){let r=t.children,l=-1;for(;++l<r.length;){let i=gn(e,r[l],t);if(i){if(l&&"break"===r[l-1].type&&(!Array.isArray(i)&&"text"===i.type&&(i.value=i.value.replace(/^\s+/,"")),!Array.isArray(i)&&"element"===i.type)){let e=i.children[0];e&&"text"===e.type&&(e.value=e.value.replace(/^\s+/,""))}Array.isArray(i)?n.push(...i):n.push(i)}}}return n}function yn(e,t){let n=[],r=-1;for(t&&n.push({type:"text",value:"\n"});++r<e.length;)r&&n.push({type:"text",value:"\n"}),n.push(e[r]);return t&&e.length>0&&n.push({type:"text",value:"\n"}),n}function bn(e,t){let n=pn(e,t),i=n.one(e,null),o=function(e){let t=[],n=-1;for(;++n<e.footnoteOrder.length;){let r=e.footnoteById[e.footnoteOrder[n]];if(!r)continue;let l=e.all(r),i=String(r.identifier).toUpperCase(),o=Vt(i.toLowerCase()),a=0,u=[];for(;++a<=e.footnoteCounts[i];){let t={type:"element",tagName:"a",properties:{href:"#"+e.clobberPrefix+"fnref-"+o+(a>1?"-"+a:""),dataFootnoteBackref:!0,className:["data-footnote-backref"],ariaLabel:e.footnoteBackLabel},children:[{type:"text",value:"↩"}]};a>1&&t.children.push({type:"element",tagName:"sup",children:[{type:"text",value:String(a)}]}),u.length>0&&u.push({type:"text",value:" "}),u.push(t)}let s=l[l.length-1];if(s&&"element"===s.type&&"p"===s.tagName){let e=s.children[s.children.length-1];e&&"text"===e.type?e.value+=" ":s.children.push({type:"text",value:" "}),s.children.push(...u)}else l.push(...u);let c={type:"element",tagName:"li",properties:{id:e.clobberPrefix+"fn-"+o},children:e.wrap(l,!0)};e.patch(r,c),t.push(c)}if(0!==t.length)return{type:"element",tagName:"section",properties:{dataFootnotes:!0,className:["footnotes"]},children:[{type:"element",tagName:e.footnoteLabelTagName,properties:r(l({},JSON.parse(JSON.stringify(e.footnoteLabelProperties))),{id:"footnote-label"}),children:[{type:"text",value:e.footnoteLabel}]},{type:"text",value:"\n"},{type:"element",tagName:"ol",properties:{},children:e.wrap(t,!0)},{type:"text",value:"\n"}]}}(n);return o&&i.children.push({type:"text",value:"\n"},o),Array.isArray(i)?{type:"root",children:i}:i}var kn=function(e,t){return e&&"run"in e?function(e,t){return(n,r,l)=>{e.run(bn(n,t),r,e=>{l(e)})}}(e,t):function(e){return t=>bn(t,e)}(e||t)};var xn=e(p(),1),vn=class{constructor(e,t,n){this.property=e,this.normal=t,n&&(this.space=n)}};function wn(e,t){let n={},r={},l=-1;for(;++l<e.length;)Object.assign(n,e[l].property),Object.assign(r,e[l].normal);return new vn(n,r,t)}function Sn(e){return e.toLowerCase()}vn.prototype.property={},vn.prototype.normal={},vn.prototype.space=null;var Cn=class{constructor(e,t){this.property=e,this.attribute=t}};Cn.prototype.space=null,Cn.prototype.boolean=!1,Cn.prototype.booleanish=!1,Cn.prototype.overloadedBoolean=!1,Cn.prototype.number=!1,Cn.prototype.commaSeparated=!1,Cn.prototype.spaceSeparated=!1,Cn.prototype.commaOrSpaceSeparated=!1,Cn.prototype.mustUseProperty=!1,Cn.prototype.defined=!1;var En={};a(En,{boolean:()=>An,booleanish:()=>Dn,commaOrSpaceSeparated:()=>In,commaSeparated:()=>Pn,number:()=>On,overloadedBoolean:()=>Tn,spaceSeparated:()=>Ln});var Fn=0,An=zn(),Dn=zn(),Tn=zn(),On=zn(),Ln=zn(),Pn=zn(),In=zn();function zn(){return 2**++Fn}var Mn=Object.keys(En),Rn=class extends Cn{constructor(e,t,n,r){let l=-1;if(super(e,t),jn(this,"space",r),"number"==typeof n)for(;++l<Mn.length;){let e=Mn[l];jn(this,Mn[l],(n&En[e])===En[e])}}};function jn(e,t,n){n&&(e[t]=n)}Rn.prototype.defined=!0;var _n={}.hasOwnProperty;function Bn(e){let t,n={},r={};for(t in e.properties)if(_n.call(e.properties,t)){let l=e.properties[t],i=new Rn(t,e.transform(e.attributes||{},t),l,e.space);e.mustUseProperty&&e.mustUseProperty.includes(t)&&(i.mustUseProperty=!0),n[t]=i,r[Sn(t)]=t,r[Sn(i.attribute)]=t}return new vn(n,r,e.space)}var Nn=Bn({space:"xlink",transform:(e,t)=>"xlink:"+t.slice(5).toLowerCase(),properties:{xLinkActuate:null,xLinkArcRole:null,xLinkHref:null,xLinkRole:null,xLinkShow:null,xLinkTitle:null,xLinkType:null}}),Hn=Bn({space:"xml",transform:(e,t)=>"xml:"+t.slice(3).toLowerCase(),properties:{xmlLang:null,xmlBase:null,xmlSpace:null}});function Un(e,t){return t in e?e[t]:t}function qn(e,t){return Un(e,t.toLowerCase())}var Vn=Bn({space:"xmlns",attributes:{xmlnsxlink:"xmlns:xlink"},transform:qn,properties:{xmlns:null,xmlnsXLink:null}}),Wn=Bn({transform:(e,t)=>"role"===t?t:"aria-"+t.slice(4).toLowerCase(),properties:{ariaActiveDescendant:null,ariaAtomic:Dn,ariaAutoComplete:null,ariaBusy:Dn,ariaChecked:Dn,ariaColCount:On,ariaColIndex:On,ariaColSpan:On,ariaControls:Ln,ariaCurrent:null,ariaDescribedBy:Ln,ariaDetails:null,ariaDisabled:Dn,ariaDropEffect:Ln,ariaErrorMessage:null,ariaExpanded:Dn,ariaFlowTo:Ln,ariaGrabbed:Dn,ariaHasPopup:null,ariaHidden:Dn,ariaInvalid:null,ariaKeyShortcuts:null,ariaLabel:null,ariaLabelledBy:Ln,ariaLevel:On,ariaLive:null,ariaModal:Dn,ariaMultiLine:Dn,ariaMultiSelectable:Dn,ariaOrientation:null,ariaOwns:Ln,ariaPlaceholder:null,ariaPosInSet:On,ariaPressed:Dn,ariaReadOnly:Dn,ariaRelevant:null,ariaRequired:Dn,ariaRoleDescription:Ln,ariaRowCount:On,ariaRowIndex:On,ariaRowSpan:On,ariaSelected:Dn,ariaSetSize:On,ariaSort:null,ariaValueMax:On,ariaValueMin:On,ariaValueNow:On,ariaValueText:null,role:null}}),$n=Bn({space:"html",attributes:{acceptcharset:"accept-charset",classname:"class",htmlfor:"for",httpequiv:"http-equiv"},transform:qn,mustUseProperty:["checked","multiple","muted","selected"],properties:{abbr:null,accept:Pn,acceptCharset:Ln,accessKey:Ln,action:null,allow:null,allowFullScreen:An,allowPaymentRequest:An,allowUserMedia:An,alt:null,as:null,async:An,autoCapitalize:null,autoComplete:Ln,autoFocus:An,autoPlay:An,blocking:Ln,capture:null,charSet:null,checked:An,cite:null,className:Ln,cols:On,colSpan:null,content:null,contentEditable:Dn,controls:An,controlsList:Ln,coords:On|Pn,crossOrigin:null,data:null,dateTime:null,decoding:null,default:An,defer:An,dir:null,dirName:null,disabled:An,download:Tn,draggable:Dn,encType:null,enterKeyHint:null,fetchPriority:null,form:null,formAction:null,formEncType:null,formMethod:null,formNoValidate:An,formTarget:null,headers:Ln,height:On,hidden:An,high:On,href:null,hrefLang:null,htmlFor:Ln,httpEquiv:Ln,id:null,imageSizes:null,imageSrcSet:null,inert:An,inputMode:null,integrity:null,is:null,isMap:An,itemId:null,itemProp:Ln,itemRef:Ln,itemScope:An,itemType:Ln,kind:null,label:null,lang:null,language:null,list:null,loading:null,loop:An,low:On,manifest:null,max:null,maxLength:On,media:null,method:null,min:null,minLength:On,multiple:An,muted:An,name:null,nonce:null,noModule:An,noValidate:An,onAbort:null,onAfterPrint:null,onAuxClick:null,onBeforeMatch:null,onBeforePrint:null,onBeforeToggle:null,onBeforeUnload:null,onBlur:null,onCancel:null,onCanPlay:null,onCanPlayThrough:null,onChange:null,onClick:null,onClose:null,onContextLost:null,onContextMenu:null,onContextRestored:null,onCopy:null,onCueChange:null,onCut:null,onDblClick:null,onDrag:null,onDragEnd:null,onDragEnter:null,onDragExit:null,onDragLeave:null,onDragOver:null,onDragStart:null,onDrop:null,onDurationChange:null,onEmptied:null,onEnded:null,onError:null,onFocus:null,onFormData:null,onHashChange:null,onInput:null,onInvalid:null,onKeyDown:null,onKeyPress:null,onKeyUp:null,onLanguageChange:null,onLoad:null,onLoadedData:null,onLoadedMetadata:null,onLoadEnd:null,onLoadStart:null,onMessage:null,onMessageError:null,onMouseDown:null,onMouseEnter:null,onMouseLeave:null,onMouseMove:null,onMouseOut:null,onMouseOver:null,onMouseUp:null,onOffline:null,onOnline:null,onPageHide:null,onPageShow:null,onPaste:null,onPause:null,onPlay:null,onPlaying:null,onPopState:null,onProgress:null,onRateChange:null,onRejectionHandled:null,onReset:null,onResize:null,onScroll:null,onScrollEnd:null,onSecurityPolicyViolation:null,onSeeked:null,onSeeking:null,onSelect:null,onSlotChange:null,onStalled:null,onStorage:null,onSubmit:null,onSuspend:null,onTimeUpdate:null,onToggle:null,onUnhandledRejection:null,onUnload:null,onVolumeChange:null,onWaiting:null,onWheel:null,open:An,optimum:On,pattern:null,ping:Ln,placeholder:null,playsInline:An,popover:null,popoverTarget:null,popoverTargetAction:null,poster:null,preload:null,readOnly:An,referrerPolicy:null,rel:Ln,required:An,reversed:An,rows:On,rowSpan:On,sandbox:Ln,scope:null,scoped:An,seamless:An,selected:An,shadowRootDelegatesFocus:An,shadowRootMode:null,shape:null,size:On,sizes:null,slot:null,span:On,spellCheck:Dn,src:null,srcDoc:null,srcLang:null,srcSet:null,start:On,step:null,style:null,tabIndex:On,target:null,title:null,translate:null,type:null,typeMustMatch:An,useMap:null,value:Dn,width:On,wrap:null,align:null,aLink:null,archive:Ln,axis:null,background:null,bgColor:null,border:On,borderColor:null,bottomMargin:On,cellPadding:null,cellSpacing:null,char:null,charOff:null,classId:null,clear:null,code:null,codeBase:null,codeType:null,color:null,compact:An,declare:An,event:null,face:null,frame:null,frameBorder:null,hSpace:On,leftMargin:On,link:null,longDesc:null,lowSrc:null,marginHeight:On,marginWidth:On,noResize:An,noHref:An,noShade:An,noWrap:An,object:null,profile:null,prompt:null,rev:null,rightMargin:On,rules:null,scheme:null,scrolling:Dn,standby:null,summary:null,text:null,topMargin:On,valueType:null,version:null,vAlign:null,vLink:null,vSpace:On,allowTransparency:null,autoCorrect:null,autoSave:null,disablePictureInPicture:An,disableRemotePlayback:An,prefix:null,property:null,results:On,security:null,unselectable:null}}),Qn=Bn({space:"svg",attributes:{accentHeight:"accent-height",alignmentBaseline:"alignment-baseline",arabicForm:"arabic-form",baselineShift:"baseline-shift",capHeight:"cap-height",className:"class",clipPath:"clip-path",clipRule:"clip-rule",colorInterpolation:"color-interpolation",colorInterpolationFilters:"color-interpolation-filters",colorProfile:"color-profile",colorRendering:"color-rendering",crossOrigin:"crossorigin",dataType:"datatype",dominantBaseline:"dominant-baseline",enableBackground:"enable-background",fillOpacity:"fill-opacity",fillRule:"fill-rule",floodColor:"flood-color",floodOpacity:"flood-opacity",fontFamily:"font-family",fontSize:"font-size",fontSizeAdjust:"font-size-adjust",fontStretch:"font-stretch",fontStyle:"font-style",fontVariant:"font-variant",fontWeight:"font-weight",glyphName:"glyph-name",glyphOrientationHorizontal:"glyph-orientation-horizontal",glyphOrientationVertical:"glyph-orientation-vertical",hrefLang:"hreflang",horizAdvX:"horiz-adv-x",horizOriginX:"horiz-origin-x",horizOriginY:"horiz-origin-y",imageRendering:"image-rendering",letterSpacing:"letter-spacing",lightingColor:"lighting-color",markerEnd:"marker-end",markerMid:"marker-mid",markerStart:"marker-start",navDown:"nav-down",navDownLeft:"nav-down-left",navDownRight:"nav-down-right",navLeft:"nav-left",navNext:"nav-next",navPrev:"nav-prev",navRight:"nav-right",navUp:"nav-up",navUpLeft:"nav-up-left",navUpRight:"nav-up-right",onAbort:"onabort",onActivate:"onactivate",onAfterPrint:"onafterprint",onBeforePrint:"onbeforeprint",onBegin:"onbegin",onCancel:"oncancel",onCanPlay:"oncanplay",onCanPlayThrough:"oncanplaythrough",onChange:"onchange",onClick:"onclick",onClose:"onclose",onCopy:"oncopy",onCueChange:"oncuechange",onCut:"oncut",onDblClick:"ondblclick",onDrag:"ondrag",onDragEnd:"ondragend",onDragEnter:"ondragenter",onDragExit:"ondragexit",onDragLeave:"ondragleave",onDragOver:"ondragover",onDragStart:"ondragstart",onDrop:"ondrop",onDurationChange:"ondurationchange",onEmptied:"onemptied",onEnd:"onend",onEnded:"onended",onError:"onerror",onFocus:"onfocus",onFocusIn:"onfocusin",onFocusOut:"onfocusout",onHashChange:"onhashchange",onInput:"oninput",onInvalid:"oninvalid",onKeyDown:"onkeydown",onKeyPress:"onkeypress",onKeyUp:"onkeyup",onLoad:"onload",onLoadedData:"onloadeddata",onLoadedMetadata:"onloadedmetadata",onLoadStart:"onloadstart",onMessage:"onmessage",onMouseDown:"onmousedown",onMouseEnter:"onmouseenter",onMouseLeave:"onmouseleave",onMouseMove:"onmousemove",onMouseOut:"onmouseout",onMouseOver:"onmouseover",onMouseUp:"onmouseup",onMouseWheel:"onmousewheel",onOffline:"onoffline",onOnline:"ononline",onPageHide:"onpagehide",onPageShow:"onpageshow",onPaste:"onpaste",onPause:"onpause",onPlay:"onplay",onPlaying:"onplaying",onPopState:"onpopstate",onProgress:"onprogress",onRateChange:"onratechange",onRepeat:"onrepeat",onReset:"onreset",onResize:"onresize",onScroll:"onscroll",onSeeked:"onseeked",onSeeking:"onseeking",onSelect:"onselect",onShow:"onshow",onStalled:"onstalled",onStorage:"onstorage",onSubmit:"onsubmit",onSuspend:"onsuspend",onTimeUpdate:"ontimeupdate",onToggle:"ontoggle",onUnload:"onunload",onVolumeChange:"onvolumechange",onWaiting:"onwaiting",onZoom:"onzoom",overlinePosition:"overline-position",overlineThickness:"overline-thickness",paintOrder:"paint-order",panose1:"panose-1",pointerEvents:"pointer-events",referrerPolicy:"referrerpolicy",renderingIntent:"rendering-intent",shapeRendering:"shape-rendering",stopColor:"stop-color",stopOpacity:"stop-opacity",strikethroughPosition:"strikethrough-position",strikethroughThickness:"strikethrough-thickness",strokeDashArray:"stroke-dasharray",strokeDashOffset:"stroke-dashoffset",strokeLineCap:"stroke-linecap",strokeLineJoin:"stroke-linejoin",strokeMiterLimit:"stroke-miterlimit",strokeOpacity:"stroke-opacity",strokeWidth:"stroke-width",tabIndex:"tabindex",textAnchor:"text-anchor",textDecoration:"text-decoration",textRendering:"text-rendering",transformOrigin:"transform-origin",typeOf:"typeof",underlinePosition:"underline-position",underlineThickness:"underline-thickness",unicodeBidi:"unicode-bidi",unicodeRange:"unicode-range",unitsPerEm:"units-per-em",vAlphabetic:"v-alphabetic",vHanging:"v-hanging",vIdeographic:"v-ideographic",vMathematical:"v-mathematical",vectorEffect:"vector-effect",vertAdvY:"vert-adv-y",vertOriginX:"vert-origin-x",vertOriginY:"vert-origin-y",wordSpacing:"word-spacing",writingMode:"writing-mode",xHeight:"x-height",playbackOrder:"playbackorder",timelineBegin:"timelinebegin"},transform:Un,properties:{about:In,accentHeight:On,accumulate:null,additive:null,alignmentBaseline:null,alphabetic:On,amplitude:On,arabicForm:null,ascent:On,attributeName:null,attributeType:null,azimuth:On,bandwidth:null,baselineShift:null,baseFrequency:null,baseProfile:null,bbox:null,begin:null,bias:On,by:null,calcMode:null,capHeight:On,className:Ln,clip:null,clipPath:null,clipPathUnits:null,clipRule:null,color:null,colorInterpolation:null,colorInterpolationFilters:null,colorProfile:null,colorRendering:null,content:null,contentScriptType:null,contentStyleType:null,crossOrigin:null,cursor:null,cx:null,cy:null,d:null,dataType:null,defaultAction:null,descent:On,diffuseConstant:On,direction:null,display:null,dur:null,divisor:On,dominantBaseline:null,download:An,dx:null,dy:null,edgeMode:null,editable:null,elevation:On,enableBackground:null,end:null,event:null,exponent:On,externalResourcesRequired:null,fill:null,fillOpacity:On,fillRule:null,filter:null,filterRes:null,filterUnits:null,floodColor:null,floodOpacity:null,focusable:null,focusHighlight:null,fontFamily:null,fontSize:null,fontSizeAdjust:null,fontStretch:null,fontStyle:null,fontVariant:null,fontWeight:null,format:null,fr:null,from:null,fx:null,fy:null,g1:Pn,g2:Pn,glyphName:Pn,glyphOrientationHorizontal:null,glyphOrientationVertical:null,glyphRef:null,gradientTransform:null,gradientUnits:null,handler:null,hanging:On,hatchContentUnits:null,hatchUnits:null,height:null,href:null,hrefLang:null,horizAdvX:On,horizOriginX:On,horizOriginY:On,id:null,ideographic:On,imageRendering:null,initialVisibility:null,in:null,in2:null,intercept:On,k:On,k1:On,k2:On,k3:On,k4:On,kernelMatrix:In,kernelUnitLength:null,keyPoints:null,keySplines:null,keyTimes:null,kerning:null,lang:null,lengthAdjust:null,letterSpacing:null,lightingColor:null,limitingConeAngle:On,local:null,markerEnd:null,markerMid:null,markerStart:null,markerHeight:null,markerUnits:null,markerWidth:null,mask:null,maskContentUnits:null,maskUnits:null,mathematical:null,max:null,media:null,mediaCharacterEncoding:null,mediaContentEncodings:null,mediaSize:On,mediaTime:null,method:null,min:null,mode:null,name:null,navDown:null,navDownLeft:null,navDownRight:null,navLeft:null,navNext:null,navPrev:null,navRight:null,navUp:null,navUpLeft:null,navUpRight:null,numOctaves:null,observer:null,offset:null,onAbort:null,onActivate:null,onAfterPrint:null,onBeforePrint:null,onBegin:null,onCancel:null,onCanPlay:null,onCanPlayThrough:null,onChange:null,onClick:null,onClose:null,onCopy:null,onCueChange:null,onCut:null,onDblClick:null,onDrag:null,onDragEnd:null,onDragEnter:null,onDragExit:null,onDragLeave:null,onDragOver:null,onDragStart:null,onDrop:null,onDurationChange:null,onEmptied:null,onEnd:null,onEnded:null,onError:null,onFocus:null,onFocusIn:null,onFocusOut:null,onHashChange:null,onInput:null,onInvalid:null,onKeyDown:null,onKeyPress:null,onKeyUp:null,onLoad:null,onLoadedData:null,onLoadedMetadata:null,onLoadStart:null,onMessage:null,onMouseDown:null,onMouseEnter:null,onMouseLeave:null,onMouseMove:null,onMouseOut:null,onMouseOver:null,onMouseUp:null,onMouseWheel:null,onOffline:null,onOnline:null,onPageHide:null,onPageShow:null,onPaste:null,onPause:null,onPlay:null,onPlaying:null,onPopState:null,onProgress:null,onRateChange:null,onRepeat:null,onReset:null,onResize:null,onScroll:null,onSeeked:null,onSeeking:null,onSelect:null,onShow:null,onStalled:null,onStorage:null,onSubmit:null,onSuspend:null,onTimeUpdate:null,onToggle:null,onUnload:null,onVolumeChange:null,onWaiting:null,onZoom:null,opacity:null,operator:null,order:null,orient:null,orientation:null,origin:null,overflow:null,overlay:null,overlinePosition:On,overlineThickness:On,paintOrder:null,panose1:null,path:null,pathLength:On,patternContentUnits:null,patternTransform:null,patternUnits:null,phase:null,ping:Ln,pitch:null,playbackOrder:null,pointerEvents:null,points:null,pointsAtX:On,pointsAtY:On,pointsAtZ:On,preserveAlpha:null,preserveAspectRatio:null,primitiveUnits:null,propagate:null,property:In,r:null,radius:null,referrerPolicy:null,refX:null,refY:null,rel:In,rev:In,renderingIntent:null,repeatCount:null,repeatDur:null,requiredExtensions:In,requiredFeatures:In,requiredFonts:In,requiredFormats:In,resource:null,restart:null,result:null,rotate:null,rx:null,ry:null,scale:null,seed:null,shapeRendering:null,side:null,slope:null,snapshotTime:null,specularConstant:On,specularExponent:On,spreadMethod:null,spacing:null,startOffset:null,stdDeviation:null,stemh:null,stemv:null,stitchTiles:null,stopColor:null,stopOpacity:null,strikethroughPosition:On,strikethroughThickness:On,string:null,stroke:null,strokeDashArray:In,strokeDashOffset:null,strokeLineCap:null,strokeLineJoin:null,strokeMiterLimit:On,strokeOpacity:On,strokeWidth:null,style:null,surfaceScale:On,syncBehavior:null,syncBehaviorDefault:null,syncMaster:null,syncTolerance:null,syncToleranceDefault:null,systemLanguage:In,tabIndex:On,tableValues:null,target:null,targetX:On,targetY:On,textAnchor:null,textDecoration:null,textRendering:null,textLength:null,timelineBegin:null,title:null,transformBehavior:null,type:null,typeOf:In,to:null,transform:null,transformOrigin:null,u1:null,u2:null,underlinePosition:On,underlineThickness:On,unicode:null,unicodeBidi:null,unicodeRange:null,unitsPerEm:On,values:null,vAlphabetic:On,vMathematical:On,vectorEffect:null,vHanging:On,vIdeographic:On,version:null,vertAdvY:On,vertOriginX:On,vertOriginY:On,viewBox:null,viewTarget:null,visibility:null,width:null,widths:null,wordSpacing:null,writingMode:null,x:null,x1:null,x2:null,xChannelSelector:null,xHeight:On,y:null,y1:null,y2:null,yChannelSelector:null,z:null,zoomAndPan:null}}),Yn=/^data[-\w.:]+$/i,Kn=/-[a-z]/g,Xn=/[A-Z]/g;function Zn(e){return"-"+e.toLowerCase()}function Jn(e){return e.charAt(1).toUpperCase()}var Gn={classId:"classID",dataType:"datatype",itemId:"itemID",strokeDashArray:"strokeDasharray",strokeDashOffset:"strokeDashoffset",strokeLineCap:"strokeLinecap",strokeLineJoin:"strokeLinejoin",strokeMiterLimit:"strokeMiterlimit",typeOf:"typeof",xLinkActuate:"xlinkActuate",xLinkArcRole:"xlinkArcrole",xLinkHref:"xlinkHref",xLinkRole:"xlinkRole",xLinkShow:"xlinkShow",xLinkTitle:"xlinkTitle",xLinkType:"xlinkType",xmlnsXLink:"xmlnsXlink"},er=wn([Hn,Nn,Vn,Wn,$n],"html"),tr=wn([Hn,Nn,Vn,Wn,Qn],"svg");function nr(e){if(e.allowedElements&&e.disallowedElements)throw new TypeError("Only one of `allowedElements` and `disallowedElements` should be defined");if(e.allowedElements||e.disallowedElements||e.allowElement)return t=>{un(t,"element",(t,n,r)=>{let l,i=r;if(e.allowedElements?l=!e.allowedElements.includes(t.tagName):e.disallowedElements&&(l=e.disallowedElements.includes(t.tagName)),!l&&e.allowElement&&"number"==typeof n&&(l=!e.allowElement(t,n,i)),l&&"number"==typeof n)return e.unwrapDisallowed&&t.children?i.children.splice(n,1,...t.children):i.children.splice(n,1),n})}}var rr=e(t(),1),lr=e(o(),1);function ir(e){let t=e&&"object"==typeof e&&"text"===e.type?e.value||"":e;return"string"==typeof t&&""===t.replace(/[ \t\n\f\r]/g,"")}var or=e(h(),1).default,ar={}.hasOwnProperty,ur=new Set(["table","thead","tbody","tfoot","tr"]);function sr(e,t){let n,r=[],l=-1;for(;++l<t.children.length;)n=t.children[l],"element"===n.type?r.push(cr(e,n,l,t)):"text"===n.type?("element"!==t.type||!ur.has(t.tagName)||!ir(n))&&r.push(n.value):"raw"===n.type&&!e.options.skipHtml&&r.push(n.value);return r}function cr(e,t,n,r){let l,i=e.options,o=void 0===i.transformLinkUri?y:i.transformLinkUri,a=e.schema,u=t.tagName,s={},c=a;if("html"===a.space&&"svg"===u&&(c=tr,e.schema=c),t.properties)for(l in t.properties)ar.call(t.properties,l)&&pr(s,l,t.properties[l],e);("ol"===u||"ul"===u)&&e.listDepth++;let f=sr(e,t);("ol"===u||"ul"===u)&&e.listDepth--,e.schema=a;let p=t.position||{start:{line:null,column:null,offset:null},end:{line:null,column:null,offset:null}},d=i.components&&ar.call(i.components,u)?i.components[u]:u,h="string"==typeof d||d===rr.default.Fragment;if(!lr.default.isValidElementType(d))throw new TypeError(`Component for name \`${u}\` not defined or is not renderable`);if(s.key=n,"a"===u&&i.linkTarget&&(s.target="function"==typeof i.linkTarget?i.linkTarget(String(s.href||""),t.children,"string"==typeof s.title?s.title:null):i.linkTarget),"a"===u&&o&&(s.href=o(String(s.href||""),t.children,"string"==typeof s.title?s.title:null)),!h&&"code"===u&&"element"===r.type&&"pre"!==r.tagName&&(s.inline=!0),!h&&("h1"===u||"h2"===u||"h3"===u||"h4"===u||"h5"===u||"h6"===u)&&(s.level=Number.parseInt(u.charAt(1),10)),"img"===u&&i.transformImageUri&&(s.src=i.transformImageUri(String(s.src||""),String(s.alt||""),"string"==typeof s.title?s.title:null)),!h&&"li"===u&&"element"===r.type){let e=function(e){let t=-1;for(;++t<e.children.length;){let n=e.children[t];if("element"===n.type&&"input"===n.tagName)return n}return null}(t);s.checked=e&&e.properties?!!e.properties.checked:null,s.index=fr(r,t),s.ordered="ol"===r.tagName}return!h&&("ol"===u||"ul"===u)&&(s.ordered="ol"===u,s.depth=e.listDepth),("td"===u||"th"===u)&&(s.align&&(s.style||(s.style={}),s.style.textAlign=s.align,delete s.align),h||(s.isHeader="th"===u)),!h&&"tr"===u&&"element"===r.type&&(s.isHeader="thead"===r.tagName),i.sourcePos&&(s["data-sourcepos"]=function(e){return[e.start.line,":",e.start.column,"-",e.end.line,":",e.end.column].map(String).join("")}(p)),!h&&i.rawSourcePos&&(s.sourcePosition=t.position),!h&&i.includeElementIndex&&(s.index=fr(r,t),s.siblingCount=fr(r)),h||(s.node=t),f.length>0?rr.default.createElement(d,s,f):rr.default.createElement(d,s)}function fr(e,t){let n=-1,r=0;for(;++n<e.children.length&&e.children[n]!==t;)"element"===e.children[n].type&&r++;return r}function pr(e,t,n,r){let l=function(e,t){let n=Sn(t),r=t,l=Cn;if(n in e.normal)return e.property[e.normal[n]];if(n.length>4&&"data"===n.slice(0,4)&&Yn.test(t)){if("-"===t.charAt(4)){let e=t.slice(5).replace(Kn,Jn);r="data"+e.charAt(0).toUpperCase()+e.slice(1)}else{let e=t.slice(4);if(!Kn.test(e)){let n=e.replace(Xn,Zn);"-"!==n.charAt(0)&&(n="-"+n),t="data"+n}}l=Rn}return new l(r,t)}(r.schema,t),i=n;null==i||i!=i||(Array.isArray(i)&&(i=l.commaSeparated?function(e){let t={};return(""===e[e.length-1]?[...e,""]:e).join((t.padRight?" ":"")+","+(!1===t.padLeft?"":" ")).trim()}(i):function(e){return e.join(" ").trim()}(i)),"style"===l.property&&"string"==typeof i&&(i=function(e){let t={};try{or(e,n)}catch(r){}return t;function n(e,n){let r="-ms-"===e.slice(0,4)?`ms-${e.slice(4)}`:e;t[r.replace(/-([a-z])/g,dr)]=n}}(i)),l.space&&l.property?e[ar.call(Gn,l.property)?Gn[l.property]:l.property]=i:l.attribute&&(e[l.attribute]=i))}function dr(e,t){return t.toUpperCase()}var hr={}.hasOwnProperty,gr={plugins:{to:"remarkPlugins",id:"change-plugins-to-remarkplugins"},renderers:{to:"components",id:"change-renderers-to-components"},astPlugins:{id:"remove-buggy-html-in-markdown-parser"},allowDangerousHtml:{id:"remove-buggy-html-in-markdown-parser"},escapeHtml:{id:"remove-buggy-html-in-markdown-parser"},source:{to:"children",id:"change-source-to-children"},allowNode:{to:"allowElement",id:"replace-allownode-allowedtypes-and-disallowedtypes"},allowedTypes:{to:"allowedElements",id:"replace-allownode-allowedtypes-and-disallowedtypes"},disallowedTypes:{to:"disallowedElements",id:"replace-allownode-allowedtypes-and-disallowedtypes"},includeNodeIndex:{to:"includeElementIndex",id:"change-includenodeindex-to-includeelementindex"}};function mr(e){for(let r in gr)if(hr.call(gr,r)&&hr.call(e,r)){let e=gr[r];console.warn(`[react-markdown] Warning: please ${e.to?`use \`${e.to}\` instead of`:"remove"} \`${r}\` (see <https://github.com/remarkjs/react-markdown/blob/main/changelog.md#${e.id}> for more info)`),delete gr[r]}let t=N().use(qt).use(e.remarkPlugins||[]).use(kn,r(l({},e.remarkRehypeOptions),{allowDangerousHtml:!0})).use(e.rehypePlugins||[]).use(nr,e),n=new L;"string"==typeof e.children?n.value=e.children:void 0!==e.children&&null!==e.children&&console.warn(`[react-markdown] Warning: please pass a string as \`children\` (not: \`${e.children}\`)`);let i=t.runSync(t.parse(n),n);if("root"!==i.type)throw new TypeError("Expected a `root` node");let o=b.default.createElement(b.default.Fragment,{},sr({options:e,schema:er,listDepth:0},i));return e.className&&(o=b.default.createElement("div",{className:e.className},o)),o}mr.propTypes={children:xn.default.string,className:xn.default.string,allowElement:xn.default.func,allowedElements:xn.default.arrayOf(xn.default.string),disallowedElements:xn.default.arrayOf(xn.default.string),unwrapDisallowed:xn.default.bool,remarkPlugins:xn.default.arrayOf(xn.default.oneOfType([xn.default.object,xn.default.func,xn.default.arrayOf(xn.default.oneOfType([xn.default.bool,xn.default.string,xn.default.object,xn.default.func,xn.default.arrayOf(xn.default.any)]))])),rehypePlugins:xn.default.arrayOf(xn.default.oneOfType([xn.default.object,xn.default.func,xn.default.arrayOf(xn.default.oneOfType([xn.default.bool,xn.default.string,xn.default.object,xn.default.func,xn.default.arrayOf(xn.default.any)]))])),sourcePos:xn.default.bool,rawSourcePos:xn.default.bool,skipHtml:xn.default.bool,includeElementIndex:xn.default.bool,transformLinkUri:xn.default.oneOfType([xn.default.func,xn.default.bool]),linkTarget:xn.default.oneOfType([xn.default.func,xn.default.string]),transformImageUri:xn.default.func,components:xn.default.object};for(var yr=(0,g.default)(mr)`
  ${"\n  color-scheme: light;\n  --color-prettylights-syntax-comment: #6e7781;\n  --color-prettylights-syntax-constant: #0550ae;\n  --color-prettylights-syntax-entity: #8250df;\n  --color-prettylights-syntax-storage-modifier-import: #24292f;\n  --color-prettylights-syntax-entity-tag: #116329;\n  --color-prettylights-syntax-keyword: #cf222e;\n  --color-prettylights-syntax-string: #0a3069;\n  --color-prettylights-syntax-variable: #953800;\n  --color-prettylights-syntax-brackethighlighter-unmatched: #82071e;\n  --color-prettylights-syntax-invalid-illegal-text: #f6f8fa;\n  --color-prettylights-syntax-invalid-illegal-bg: #82071e;\n  --color-prettylights-syntax-carriage-return-text: #f6f8fa;\n  --color-prettylights-syntax-carriage-return-bg: #cf222e;\n  --color-prettylights-syntax-string-regexp: #116329;\n  --color-prettylights-syntax-markup-list: #3b2300;\n  --color-prettylights-syntax-markup-heading: #0550ae;\n  --color-prettylights-syntax-markup-italic: #24292f;\n  --color-prettylights-syntax-markup-bold: #24292f;\n  --color-prettylights-syntax-markup-deleted-text: #82071e;\n  --color-prettylights-syntax-markup-deleted-bg: #ffebe9;\n  --color-prettylights-syntax-markup-inserted-text: #116329;\n  --color-prettylights-syntax-markup-inserted-bg: #dafbe1;\n  --color-prettylights-syntax-markup-changed-text: #953800;\n  --color-prettylights-syntax-markup-changed-bg: #ffd8b5;\n  --color-prettylights-syntax-markup-ignored-text: #eaeef2;\n  --color-prettylights-syntax-markup-ignored-bg: #0550ae;\n  --color-prettylights-syntax-meta-diff-range: #8250df;\n  --color-prettylights-syntax-brackethighlighter-angle: #57606a;\n  --color-prettylights-syntax-sublimelinter-gutter-mark: #8c959f;\n  --color-prettylights-syntax-constant-other-reference-link: #0a3069;\n  --color-fg-default: #24292f;\n  --color-fg-muted: #57606a;\n  --color-fg-subtle: #6e7781;\n  --color-canvas-default: #ffffff;\n  --color-canvas-subtle: #f6f8fa;\n  --color-border-default: #d0d7de;\n  --color-border-muted: hsla(210, 18%, 87%, 1);\n  --color-neutral-muted: rgba(175, 184, 193, 0.2);\n  --color-accent-fg: #0969da;\n  --color-accent-emphasis: #0969da;\n  --color-attention-subtle: #fff8c5;\n  --color-danger-fg: #cf222e;\n"}
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  margin: 0;
  color: var(--color-fg-default);
  background-color: var(--color-canvas-default);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji';
  font-size: 16px;
  line-height: 1.5;
  word-wrap: break-word;

  .octicon {
    display: inline-block;
    fill: currentColor;
    vertical-align: text-bottom;
  }
  h1:hover .anchor .octicon-link:before,
  h2:hover .anchor .octicon-link:before,
  h3:hover .anchor .octicon-link:before,
  h4:hover .anchor .octicon-link:before,
  h5:hover .anchor .octicon-link:before,
  h6:hover .anchor .octicon-link:before {
    width: 16px;
    height: 16px;
    content: ' ';
    display: inline-block;
    background-color: currentColor;
    -webkit-mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' aria-hidden='true'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>");
    mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' aria-hidden='true'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>");
  }

  details,
  figcaption,
  figure {
    display: block;
  }

  summary {
    display: list-item;
  }

  [hidden] {
    display: none !important;
  }

  a {
    background-color: transparent;
    color: var(--color-accent-fg);
    text-decoration: none;
  }

  abbr[title] {
    border-bottom: none;
    text-decoration: underline dotted;
  }

  b,
  strong {
    font-weight: var(--base-text-weight-semibold, 600);
  }

  dfn {
    font-style: italic;
  }

  h1 {
    margin: 0.67em 0;
    font-weight: var(--base-text-weight-semibold, 600);
    padding-bottom: 0.3em;
    font-size: 2em;
    border-bottom: 1px solid var(--color-border-muted);
  }

  mark {
    background-color: var(--color-attention-subtle);
    color: var(--color-fg-default);
  }

  small {
    font-size: 90%;
  }

  sub,
  sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }

  sub {
    bottom: -0.25em;
  }

  sup {
    top: -0.5em;
  }

  img {
    border-style: none;
    max-width: 100%;
    box-sizing: content-box;
    background-color: var(--color-canvas-default);
  }

  code,
  kbd,
  pre,
  samp {
    font-family: monospace;
    font-size: 1em;
  }

  figure {
    margin: 1em 40px;
  }

  hr {
    box-sizing: content-box;
    overflow: hidden;
    background: transparent;
    border-bottom: 1px solid var(--color-border-muted);
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: var(--color-border-default);
    border: 0;
  }

  input {
    font: inherit;
    margin: 0;
    overflow: visible;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  [type='button'],
  [type='reset'],
  [type='submit'] {
    -webkit-appearance: button;
  }

  [type='checkbox'],
  [type='radio'] {
    box-sizing: border-box;
    padding: 0;
  }

  [type='number']::-webkit-inner-spin-button,
  [type='number']::-webkit-outer-spin-button {
    height: auto;
  }

  [type='search']::-webkit-search-cancel-button,
  [type='search']::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-input-placeholder {
    color: inherit;
    opacity: 0.54;
  }

  ::-webkit-file-upload-button {
    -webkit-appearance: button;
    font: inherit;
  }

  a:hover {
    text-decoration: underline;
  }

  ::placeholder {
    color: var(--color-fg-subtle);
    opacity: 1;
  }

  hr::before {
    display: table;
    content: '';
  }

  hr::after {
    display: table;
    clear: both;
    content: '';
  }

  table {
    border-spacing: 0;
    border-collapse: collapse;
    display: block;
    width: max-content;
    max-width: 100%;
    overflow: auto;
  }

  td,
  th {
    padding: 0;
  }

  details summary {
    cursor: pointer;
  }

  details:not([open]) > *:not(summary) {
    display: none !important;
  }

  a:focus,
  [role='button']:focus,
  input[type='radio']:focus,
  input[type='checkbox']:focus {
    outline: 2px solid var(--color-accent-fg);
    outline-offset: -2px;
    box-shadow: none;
  }

  a:focus:not(:focus-visible),
  [role='button']:focus:not(:focus-visible),
  input[type='radio']:focus:not(:focus-visible),
  input[type='checkbox']:focus:not(:focus-visible) {
    outline: solid 1px transparent;
  }

  a:focus-visible,
  [role='button']:focus-visible,
  input[type='radio']:focus-visible,
  input[type='checkbox']:focus-visible {
    outline: 2px solid var(--color-accent-fg);
    outline-offset: -2px;
    box-shadow: none;
  }

  a:not([class]):focus,
  a:not([class]):focus-visible,
  input[type='radio']:focus,
  input[type='radio']:focus-visible,
  input[type='checkbox']:focus,
  input[type='checkbox']:focus-visible {
    outline-offset: 0;
  }

  kbd {
    display: inline-block;
    padding: 3px 5px;
    font: 11px ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
    line-height: 10px;
    color: var(--color-fg-default);
    vertical-align: middle;
    background-color: var(--color-canvas-subtle);
    border: solid 1px var(--color-neutral-muted);
    border-bottom-color: var(--color-neutral-muted);
    border-radius: 6px;
    box-shadow: inset 0 -1px 0 var(--color-neutral-muted);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: var(--base-text-weight-semibold, 600);
    line-height: 1.25;
  }

  h2 {
    font-weight: var(--base-text-weight-semibold, 600);
    padding-bottom: 0.3em;
    font-size: 1.5em;
    border-bottom: 1px solid var(--color-border-muted);
  }

  h3 {
    font-weight: var(--base-text-weight-semibold, 600);
    font-size: 1.25em;
  }

  h4 {
    font-weight: var(--base-text-weight-semibold, 600);
    font-size: 1em;
  }

  h5 {
    font-weight: var(--base-text-weight-semibold, 600);
    font-size: 0.875em;
  }

  h6 {
    font-weight: var(--base-text-weight-semibold, 600);
    font-size: 0.85em;
    color: var(--color-fg-muted);
  }

  p {
    margin-top: 0;
    margin-bottom: 10px;
  }

  blockquote {
    margin: 0;
    padding: 0 1em;
    color: var(--color-fg-muted);
    border-left: 0.25em solid var(--color-border-default);
  }

  ul,
  ol {
    margin-top: 0;
    margin-bottom: 0;
    padding-left: 2em;
  }

  ol ol,
  ul ol {
    list-style-type: lower-roman;
  }

  ul ul ol,
  ul ol ol,
  ol ul ol,
  ol ol ol {
    list-style-type: lower-alpha;
  }

  dd {
    margin-left: 0;
  }

  tt,
  code,
  samp {
    font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
    font-size: 12px;
  }

  pre {
    margin-top: 0;
    margin-bottom: 0;
    font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
    font-size: 12px;
    word-wrap: normal;
  }

  .octicon {
    display: inline-block;
    overflow: visible !important;
    vertical-align: text-bottom;
    fill: currentColor;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    margin: 0;
    -webkit-appearance: none;
    appearance: none;
  }

  .markdown-body::before {
    display: table;
    content: '';
  }

  .markdown-body::after {
    display: table;
    clear: both;
    content: '';
  }

  .markdown-body > *:first-child {
    margin-top: 0 !important;
  }

  .markdown-body > *:last-child {
    margin-bottom: 0 !important;
  }

  a:not([href]) {
    color: inherit;
    text-decoration: none;
  }

  .absent {
    color: var(--color-danger-fg);
  }

  .anchor {
    float: left;
    padding-right: 4px;
    margin-left: -20px;
    line-height: 1;
  }

  .anchor:focus {
    outline: none;
  }

  p,
  blockquote,
  ul,
  ol,
  dl,
  table,
  pre,
  details {
    margin-top: 0;
    margin-bottom: 16px;
  }

  blockquote > :first-child {
    margin-top: 0;
  }

  blockquote > :last-child {
    margin-bottom: 0;
  }

  h1 .octicon-link,
  h2 .octicon-link,
  h3 .octicon-link,
  h4 .octicon-link,
  h5 .octicon-link,
  h6 .octicon-link {
    color: var(--color-fg-default);
    vertical-align: middle;
    visibility: hidden;
  }

  h1:hover .anchor,
  h2:hover .anchor,
  h3:hover .anchor,
  h4:hover .anchor,
  h5:hover .anchor,
  h6:hover .anchor {
    text-decoration: none;
  }

  h1:hover .anchor .octicon-link,
  h2:hover .anchor .octicon-link,
  h3:hover .anchor .octicon-link,
  h4:hover .anchor .octicon-link,
  h5:hover .anchor .octicon-link,
  h6:hover .anchor .octicon-link {
    visibility: visible;
  }

  h1 tt,
  h1 code,
  h2 tt,
  h2 code,
  h3 tt,
  h3 code,
  h4 tt,
  h4 code,
  h5 tt,
  h5 code,
  h6 tt,
  h6 code {
    padding: 0 0.2em;
    font-size: inherit;
  }

  summary h1,
  summary h2,
  summary h3,
  summary h4,
  summary h5,
  summary h6 {
    display: inline-block;
  }

  summary h1 .anchor,
  summary h2 .anchor,
  summary h3 .anchor,
  summary h4 .anchor,
  summary h5 .anchor,
  summary h6 .anchor {
    margin-left: -40px;
  }

  summary h1,
  summary h2 {
    padding-bottom: 0;
    border-bottom: 0;
  }

  ul.no-list,
  ol.no-list {
    padding: 0;
    list-style-type: none;
  }

  ol[type='a'] {
    list-style-type: lower-alpha;
  }

  ol[type='A'] {
    list-style-type: upper-alpha;
  }

  ol[type='i'] {
    list-style-type: lower-roman;
  }

  ol[type='I'] {
    list-style-type: upper-roman;
  }

  ol[type='1'] {
    list-style-type: decimal;
  }

  div > ol:not([type]) {
    list-style-type: decimal;
  }

  ul ul,
  ul ol,
  ol ol,
  ol ul {
    margin-top: 0;
    margin-bottom: 0;
  }

  li > p {
    margin-top: 16px;
  }

  li + li {
    margin-top: 0.25em;
  }

  dl {
    padding: 0;
  }

  dl dt {
    padding: 0;
    margin-top: 16px;
    font-size: 1em;
    font-style: italic;
    font-weight: var(--base-text-weight-semibold, 600);
  }

  dl dd {
    padding: 0 16px;
    margin-bottom: 16px;
  }

  table th {
    font-weight: var(--base-text-weight-semibold, 600);
  }

  table th,
  table td {
    padding: 6px 13px;
    border: 1px solid var(--color-border-default);
  }

  table tr {
    background-color: var(--color-canvas-default);
    border-top: 1px solid var(--color-border-muted);
  }

  table tr:nth-child(2n) {
    background-color: var(--color-canvas-subtle);
  }

  table img {
    background-color: transparent;
  }

  img[align='right'] {
    padding-left: 20px;
  }

  img[align='left'] {
    padding-right: 20px;
  }

  .emoji {
    max-width: none;
    vertical-align: text-top;
    background-color: transparent;
  }

  span.frame {
    display: block;
    overflow: hidden;
  }

  span.frame > span {
    display: block;
    float: left;
    width: auto;
    padding: 7px;
    margin: 13px 0 0;
    overflow: hidden;
    border: 1px solid var(--color-border-default);
  }

  span.frame span img {
    display: block;
    float: left;
  }

  span.frame span span {
    display: block;
    padding: 5px 0 0;
    clear: both;
    color: var(--color-fg-default);
  }

  span.align-center {
    display: block;
    overflow: hidden;
    clear: both;
  }

  span.align-center > span {
    display: block;
    margin: 13px auto 0;
    overflow: hidden;
    text-align: center;
  }

  span.align-center span img {
    margin: 0 auto;
    text-align: center;
  }

  span.align-right {
    display: block;
    overflow: hidden;
    clear: both;
  }

  span.align-right > span {
    display: block;
    margin: 13px 0 0;
    overflow: hidden;
    text-align: right;
  }

  span.align-right span img {
    margin: 0;
    text-align: right;
  }

  span.float-left {
    display: block;
    float: left;
    margin-right: 13px;
    overflow: hidden;
  }

  span.float-left span {
    margin: 13px 0 0;
  }

  span.float-right {
    display: block;
    float: right;
    margin-left: 13px;
    overflow: hidden;
  }

  span.float-right > span {
    display: block;
    margin: 13px auto 0;
    overflow: hidden;
    text-align: right;
  }

  code,
  tt {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    white-space: break-spaces;
    background-color: var(--color-neutral-muted);
    border-radius: 6px;
  }

  code br,
  tt br {
    display: none;
  }

  del code {
    text-decoration: inherit;
  }

  samp {
    font-size: 85%;
  }

  pre code {
    font-size: 100%;
  }

  pre > code {
    padding: 0;
    margin: 0;
    word-break: normal;
    white-space: pre;
    background: transparent;
    border: 0;
  }

  .highlight {
    margin-bottom: 16px;
  }

  .highlight pre {
    margin-bottom: 0;
    word-break: normal;
  }

  .highlight pre,
  pre {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: var(--color-canvas-subtle);
    border-radius: 6px;
  }

  pre code,
  pre tt {
    display: inline;
    max-width: auto;
    padding: 0;
    margin: 0;
    overflow: visible;
    line-height: inherit;
    word-wrap: normal;
    background-color: transparent;
    border: 0;
  }

  .csv-data td,
  .csv-data th {
    padding: 5px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1;
    text-align: left;
    white-space: nowrap;
  }

  .csv-data .blob-num {
    padding: 10px 8px 9px;
    text-align: right;
    background: var(--color-canvas-default);
    border: 0;
  }

  .csv-data tr {
    border-top: 0;
  }

  .csv-data th {
    font-weight: var(--base-text-weight-semibold, 600);
    background: var(--color-canvas-subtle);
    border-top: 0;
  }

  [data-footnote-ref]::before {
    content: '[';
  }

  [data-footnote-ref]::after {
    content: ']';
  }

  .footnotes {
    font-size: 12px;
    color: var(--color-fg-muted);
    border-top: 1px solid var(--color-border-default);
  }

  .footnotes ol {
    padding-left: 16px;
  }

  .footnotes ol ul {
    display: inline-block;
    padding-left: 16px;
    margin-top: 16px;
  }

  .footnotes li {
    position: relative;
  }

  .footnotes li:target::before {
    position: absolute;
    top: -8px;
    right: -8px;
    bottom: -8px;
    left: -24px;
    pointer-events: none;
    content: '';
    border: 2px solid var(--color-accent-emphasis);
    border-radius: 6px;
  }

  .footnotes li:target {
    color: var(--color-fg-default);
  }

  .footnotes .data-footnote-backref g-emoji {
    font-family: monospace;
  }

  .pl-c {
    color: var(--color-prettylights-syntax-comment);
  }

  .pl-c1,
  .pl-s .pl-v {
    color: var(--color-prettylights-syntax-constant);
  }

  .pl-e,
  .pl-en {
    color: var(--color-prettylights-syntax-entity);
  }

  .pl-smi,
  .pl-s .pl-s1 {
    color: var(--color-prettylights-syntax-storage-modifier-import);
  }

  .pl-ent {
    color: var(--color-prettylights-syntax-entity-tag);
  }

  .pl-k {
    color: var(--color-prettylights-syntax-keyword);
  }

  .pl-s,
  .pl-pds,
  .pl-s .pl-pse .pl-s1,
  .pl-sr,
  .pl-sr .pl-cce,
  .pl-sr .pl-sre,
  .pl-sr .pl-sra {
    color: var(--color-prettylights-syntax-string);
  }

  .pl-v,
  .pl-smw {
    color: var(--color-prettylights-syntax-variable);
  }

  .pl-bu {
    color: var(--color-prettylights-syntax-brackethighlighter-unmatched);
  }

  .pl-ii {
    color: var(--color-prettylights-syntax-invalid-illegal-text);
    background-color: var(--color-prettylights-syntax-invalid-illegal-bg);
  }

  .pl-c2 {
    color: var(--color-prettylights-syntax-carriage-return-text);
    background-color: var(--color-prettylights-syntax-carriage-return-bg);
  }

  .pl-sr .pl-cce {
    font-weight: bold;
    color: var(--color-prettylights-syntax-string-regexp);
  }

  .pl-ml {
    color: var(--color-prettylights-syntax-markup-list);
  }

  .pl-mh,
  .pl-mh .pl-en,
  .pl-ms {
    font-weight: bold;
    color: var(--color-prettylights-syntax-markup-heading);
  }

  .pl-mi {
    font-style: italic;
    color: var(--color-prettylights-syntax-markup-italic);
  }

  .pl-mb {
    font-weight: bold;
    color: var(--color-prettylights-syntax-markup-bold);
  }

  .pl-md {
    color: var(--color-prettylights-syntax-markup-deleted-text);
    background-color: var(--color-prettylights-syntax-markup-deleted-bg);
  }

  .pl-mi1 {
    color: var(--color-prettylights-syntax-markup-inserted-text);
    background-color: var(--color-prettylights-syntax-markup-inserted-bg);
  }

  .pl-mc {
    color: var(--color-prettylights-syntax-markup-changed-text);
    background-color: var(--color-prettylights-syntax-markup-changed-bg);
  }

  .pl-mi2 {
    color: var(--color-prettylights-syntax-markup-ignored-text);
    background-color: var(--color-prettylights-syntax-markup-ignored-bg);
  }

  .pl-mdr {
    font-weight: bold;
    color: var(--color-prettylights-syntax-meta-diff-range);
  }

  .pl-ba {
    color: var(--color-prettylights-syntax-brackethighlighter-angle);
  }

  .pl-sg {
    color: var(--color-prettylights-syntax-sublimelinter-gutter-mark);
  }

  .pl-corl {
    text-decoration: underline;
    color: var(--color-prettylights-syntax-constant-other-reference-link);
  }

  g-emoji {
    display: inline-block;
    min-width: 1ch;
    font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    font-size: 1em;
    font-style: normal !important;
    font-weight: var(--base-text-weight-normal, 400);
    line-height: 1;
    vertical-align: -0.075em;
  }

  g-emoji img {
    width: 1em;
    height: 1em;
  }

  .task-list-item {
    list-style-type: none;
  }

  .task-list-item label {
    font-weight: var(--base-text-weight-normal, 400);
  }

  .task-list-item.enabled label {
    cursor: pointer;
  }

  .task-list-item + .task-list-item {
    margin-top: 4px;
  }

  .task-list-item .handle {
    display: none;
  }

  .task-list-item-checkbox {
    margin: 0 0.2em 0.25em -1.4em;
    vertical-align: middle;
  }

  .contains-task-list:dir(rtl) .task-list-item-checkbox {
    margin: 0 -1.6em 0.25em 0.2em;
  }

  .contains-task-list {
    position: relative;
  }

  .contains-task-list:hover .task-list-item-convert-container,
  .contains-task-list:focus-within .task-list-item-convert-container {
    display: block;
    width: auto;
    height: 24px;
    overflow: visible;
    clip: auto;
  }

  ::-webkit-calendar-picker-indicator {
    filter: invert(50%);
  }
`,br={tokenize:function(e,t,n){let r=0;return function t(i){return(87===i||119===i)&&r<3?(r++,e.consume(i),t):46===i&&3===r?(e.consume(i),l):n(i)};function l(e){return null===e?n(e):t(e)}},partial:!0},kr={tokenize:function(e,t,n){let r,l,i;return o;function o(t){return 46===t||95===t?e.check(vr,u,a)(t):null===t||pe(t)||ge(t)||45!==t&&he(t)?u(t):(i=!0,e.consume(t),o)}function a(t){return 95===t?r=!0:(l=r,r=void 0),e.consume(t),o}function u(e){return l||r||!i?n(e):t(e)}},partial:!0},xr={tokenize:function(e,t){let n=0,r=0;return l;function l(o){return 40===o?(n++,e.consume(o),l):41===o&&r<n?i(o):33===o||34===o||38===o||39===o||41===o||42===o||44===o||46===o||58===o||59===o||60===o||63===o||93===o||95===o||126===o?e.check(vr,t,i)(o):null===o||pe(o)||ge(o)?t(o):(e.consume(o),l)}function i(t){return 41===t&&r++,e.consume(t),l}},partial:!0},vr={tokenize:function(e,t,n){return r;function r(o){return 33===o||34===o||39===o||41===o||42===o||44===o||46===o||58===o||59===o||63===o||95===o||126===o?(e.consume(o),r):38===o?(e.consume(o),i):93===o?(e.consume(o),l):60===o||null===o||pe(o)||ge(o)?t(o):n(o)}function l(e){return null===e||40===e||91===e||pe(e)||ge(e)?t(e):r(e)}function i(e){return le(e)?o(e):n(e)}function o(t){return 59===t?(e.consume(t),r):le(t)?(e.consume(t),o):n(t)}},partial:!0},wr={tokenize:function(e,t,n){return function(t){return e.consume(t),r};function r(e){return ie(e)?n(e):t(e)}},partial:!0},Sr={tokenize:function(e,t,n){let r=this;return function(t){return 87!==t&&119!==t||!Tr.call(r,r.previous)||Ir(r.events)?n(t):(e.enter("literalAutolink"),e.enter("literalAutolinkWww"),e.check(br,e.attempt(kr,e.attempt(xr,l),n),n)(t))};function l(n){return e.exit("literalAutolinkWww"),e.exit("literalAutolink"),t(n)}},previous:Tr},Cr={tokenize:function(e,t,n){let r=this,l="",i=!1;return function(t){return 72!==t&&104!==t||!Or.call(r,r.previous)||Ir(r.events)?n(t):(e.enter("literalAutolink"),e.enter("literalAutolinkHttp"),l+=String.fromCodePoint(t),e.consume(t),o)};function o(t){if(le(t)&&l.length<5)return l+=String.fromCodePoint(t),e.consume(t),o;if(58===t){let n=l.toLowerCase();if("http"===n||"https"===n)return e.consume(t),a}return n(t)}function a(t){return 47===t?(e.consume(t),i?u:(i=!0,a)):n(t)}function u(t){return null===t||ae(t)||pe(t)||ge(t)||he(t)?n(t):e.attempt(kr,e.attempt(xr,s),n)(t)}function s(n){return e.exit("literalAutolinkHttp"),e.exit("literalAutolink"),t(n)}},previous:Or},Er={tokenize:function(e,t,n){let r,l,i=this;return function(t){return Pr(t)&&Lr.call(i,i.previous)&&!Ir(i.events)?(e.enter("literalAutolink"),e.enter("literalAutolinkEmail"),o(t)):n(t)};function o(t){return Pr(t)?(e.consume(t),o):64===t?(e.consume(t),a):n(t)}function a(t){return 46===t?e.check(wr,s,u)(t):45===t||95===t||ie(t)?(l=!0,e.consume(t),a):s(t)}function u(t){return e.consume(t),r=!0,a}function s(o){return l&&r&&le(i.previous)?(e.exit("literalAutolinkEmail"),e.exit("literalAutolink"),t(o)):n(o)}},previous:Lr},Fr={},Ar={text:Fr},Dr=48;Dr<123;)Fr[Dr]=Er,58===++Dr?Dr=65:91===Dr&&(Dr=97);function Tr(e){return null===e||40===e||42===e||95===e||91===e||93===e||126===e||pe(e)}function Or(e){return!le(e)}function Lr(e){return!(47===e||Pr(e))}function Pr(e){return 43===e||45===e||46===e||95===e||ie(e)}function Ir(e){let t=e.length,n=!1;for(;t--;){let r=e[t][1];if(("labelLink"===r.type||"labelImage"===r.type)&&!r._balanced){n=!0;break}if(r._gfmAutolinkLiteralWalkedInto){n=!1;break}}return e.length>0&&!n&&(e[e.length-1][1]._gfmAutolinkLiteralWalkedInto=!0),n}Fr[43]=Er,Fr[45]=Er,Fr[46]=Er,Fr[95]=Er,Fr[72]=[Er,Cr],Fr[104]=[Er,Cr],Fr[87]=[Er,Sr],Fr[119]=[Er,Sr];var zr={tokenize:function(e,t,n){let r=this;return ye(e,function(e){let l=r.events[r.events.length-1];return l&&"gfmFootnoteDefinitionIndent"===l[1].type&&4===l[2].sliceSerialize(l[1],!0).length?t(e):n(e)},"gfmFootnoteDefinitionIndent",5)},partial:!0};function Mr(e,t,n){let r,l=this,i=l.events.length,o=l.parser.gfmFootnotes||(l.parser.gfmFootnotes=[]);for(;i--;){let e=l.events[i][1];if("labelImage"===e.type){r=e;break}if("gfmFootnoteCall"===e.type||"labelLink"===e.type||"label"===e.type||"image"===e.type||"link"===e.type)break}return function(i){if(!r||!r._balanced)return n(i);let a=We(l.sliceSerialize({start:r.end,end:l.now()}));return 94===a.codePointAt(0)&&o.includes(a.slice(1))?(e.enter("gfmFootnoteCallLabelMarker"),e.consume(i),e.exit("gfmFootnoteCallLabelMarker"),t(i)):n(i)}}function Rr(e,t){let n=e.length;for(;n--;)if("labelImage"===e[n][1].type&&"enter"===e[n][0]){e[n][1];break}e[n+1][1].type="data",e[n+3][1].type="gfmFootnoteCallLabelMarker";let r={type:"gfmFootnoteCall",start:Object.assign({},e[n+3][1].start),end:Object.assign({},e[e.length-1][1].end)},l={type:"gfmFootnoteCallMarker",start:Object.assign({},e[n+3][1].end),end:Object.assign({},e[n+3][1].end)};l.end.column++,l.end.offset++,l.end._bufferIndex++;let i={type:"gfmFootnoteCallString",start:Object.assign({},l.end),end:Object.assign({},e[e.length-1][1].start)},o={type:"chunkString",contentType:"string",start:Object.assign({},i.start),end:Object.assign({},i.end)},a=[e[n+1],e[n+2],["enter",r,t],e[n+3],e[n+4],["enter",l,t],["exit",l,t],["enter",i,t],["enter",o,t],["exit",o,t],["exit",i,t],e[e.length-2],e[e.length-1],["exit",r,t]];return e.splice(n,e.length-n+1,...a),e}function jr(e,t,n){let r,l=this,i=l.parser.gfmFootnotes||(l.parser.gfmFootnotes=[]),o=0;return function(t){return e.enter("gfmFootnoteCall"),e.enter("gfmFootnoteCallLabelMarker"),e.consume(t),e.exit("gfmFootnoteCallLabelMarker"),a};function a(t){return 94!==t?n(t):(e.enter("gfmFootnoteCallMarker"),e.consume(t),e.exit("gfmFootnoteCallMarker"),e.enter("gfmFootnoteCallString"),e.enter("chunkString").contentType="string",u)}function u(a){if(o>999||93===a&&!r||null===a||91===a||pe(a))return n(a);if(93===a){e.exit("chunkString");let r=e.exit("gfmFootnoteCallString");return i.includes(We(l.sliceSerialize(r)))?(e.enter("gfmFootnoteCallLabelMarker"),e.consume(a),e.exit("gfmFootnoteCallLabelMarker"),e.exit("gfmFootnoteCall"),t):n(a)}return pe(a)||(r=!0),o++,e.consume(a),92===a?s:u}function s(t){return 91===t||92===t||93===t?(e.consume(t),o++,u):u(t)}}function _r(e,t,n){let r,l,i=this,o=i.parser.gfmFootnotes||(i.parser.gfmFootnotes=[]),a=0;return function(t){return e.enter("gfmFootnoteDefinition")._container=!0,e.enter("gfmFootnoteDefinitionLabel"),e.enter("gfmFootnoteDefinitionLabelMarker"),e.consume(t),e.exit("gfmFootnoteDefinitionLabelMarker"),u};function u(t){return 94===t?(e.enter("gfmFootnoteDefinitionMarker"),e.consume(t),e.exit("gfmFootnoteDefinitionMarker"),e.enter("gfmFootnoteDefinitionLabelString"),e.enter("chunkString").contentType="string",s):n(t)}function s(t){if(a>999||93===t&&!l||null===t||91===t||pe(t))return n(t);if(93===t){e.exit("chunkString");let n=e.exit("gfmFootnoteDefinitionLabelString");return r=We(i.sliceSerialize(n)),e.enter("gfmFootnoteDefinitionLabelMarker"),e.consume(t),e.exit("gfmFootnoteDefinitionLabelMarker"),e.exit("gfmFootnoteDefinitionLabel"),f}return pe(t)||(l=!0),a++,e.consume(t),92===t?c:s}function c(t){return 91===t||92===t||93===t?(e.consume(t),a++,s):s(t)}function f(t){return 58===t?(e.enter("definitionMarker"),e.consume(t),e.exit("definitionMarker"),o.includes(r)||o.push(r),ye(e,p,"gfmFootnoteDefinitionWhitespace")):n(t)}function p(e){return t(e)}}function Br(e,t,n){return e.check(Fe,t,e.attempt(zr,t,n))}function Nr(e){e.exit("gfmFootnoteDefinition")}function Hr(e){let t=(e||{}).singleTilde,n={tokenize:function(e,n,r){let l=this.previous,i=this.events,o=0;return function(t){return 126===l&&"characterEscape"!==i[i.length-1][1].type?r(t):(e.enter("strikethroughSequenceTemporary"),a(t))};function a(i){let u=ve(l);if(126===i)return o>1?r(i):(e.consume(i),o++,a);if(o<2&&!t)return r(i);let s=e.exit("strikethroughSequenceTemporary"),c=ve(i);return s._open=!c||2===c&&!!u,s._close=!u||2===u&&!!c,n(i)}},resolveAll:function(e,t){let n=-1;for(;++n<e.length;)if("enter"===e[n][0]&&"strikethroughSequenceTemporary"===e[n][1].type&&e[n][1]._close){let r=n;for(;r--;)if("exit"===e[r][0]&&"strikethroughSequenceTemporary"===e[r][1].type&&e[r][1]._open&&e[n][1].end.offset-e[n][1].start.offset===e[r][1].end.offset-e[r][1].start.offset){e[n][1].type="strikethroughSequence",e[r][1].type="strikethroughSequence";let l={type:"strikethrough",start:Object.assign({},e[r][1].start),end:Object.assign({},e[n][1].end)},i={type:"strikethroughText",start:Object.assign({},e[r][1].end),end:Object.assign({},e[n][1].start)},o=[["enter",l,t],["enter",e[r][1],t],["exit",e[r][1],t],["enter",i,t]],a=t.parser.constructs.insideSpan.null;a&&J(o,o.length,0,we(a,e.slice(r+1,n),t)),J(o,o.length,0,[["exit",i,t],["enter",e[n][1],t],["exit",e[n][1],t],["exit",l,t]]),J(e,r-1,n-r+3,o),n=r+o.length-2;break}}for(n=-1;++n<e.length;)"strikethroughSequenceTemporary"===e[n][1].type&&(e[n][1].type="data");return e}};return null==t&&(t=!0),{text:{126:n},insideSpan:{null:[n]},attentionMarkers:{null:[126]}}}var Ur=class{constructor(){this.map=[]}add(e,t,n){!function(e,t,n,r){let l=0;if(0!==n||0!==r.length){for(;l<e.map.length;){if(e.map[l][0]===t)return e.map[l][1]+=n,void e.map[l][2].push(...r);l+=1}e.map.push([t,n,r])}}(this,e,t,n)}consume(e){if(this.map.sort((e,t)=>e[0]-t[0]),0===this.map.length)return;let t=this.map.length,n=[];for(;t>0;)t-=1,n.push(e.slice(this.map[t][0]+this.map[t][1])),n.push(this.map[t][2]),e.length=this.map[t][0];n.push([...e]),e.length=0;let r=n.pop();for(;r;)e.push(...r),r=n.pop();this.map.length=0}};function qr(e,t){let n=!1,r=[];for(;t<e.length;){let l=e[t];if(n){if("enter"===l[0])"tableContent"===l[1].type&&r.push("tableDelimiterMarker"===e[t+1][1].type?"left":"none");else if("tableContent"===l[1].type){if("tableDelimiterMarker"===e[t-1][1].type){let e=r.length-1;r[e]="left"===r[e]?"center":"right"}}else if("tableDelimiterRow"===l[1].type)break}else"enter"===l[0]&&"tableDelimiterRow"===l[1].type&&(n=!0);t+=1}return r}var Vr={flow:{null:{tokenize:function(e,t,n){let r,l=this,i=0,o=0;return function(e){let t=l.events.length-1;for(;t>-1;){let e=l.events[t][1].type;if("lineEnding"!==e&&"linePrefix"!==e)break;t--}let r=t>-1?l.events[t][1].type:null,i="tableHead"===r||"tableRow"===r?x:a;return i===x&&l.parser.lazy[l.now().line]?n(e):i(e)};function a(t){return e.enter("tableHead"),e.enter("tableRow"),function(e){return 124===e||(r=!0,o+=1),u(e)}(t)}function u(t){return null===t?n(t):fe(t)?o>1?(o=0,l.interrupt=!0,e.exit("tableRow"),e.enter("lineEnding"),e.consume(t),e.exit("lineEnding"),f):n(t):de(t)?ye(e,u,"whitespace")(t):(o+=1,r&&(r=!1,i+=1),124===t?(e.enter("tableCellDivider"),e.consume(t),e.exit("tableCellDivider"),r=!0,u):(e.enter("data"),s(t)))}function s(t){return null===t||124===t||pe(t)?(e.exit("data"),u(t)):(e.consume(t),92===t?c:s)}function c(t){return 92===t||124===t?(e.consume(t),s):s(t)}function f(t){return l.interrupt=!1,l.parser.lazy[l.now().line]?n(t):(e.enter("tableDelimiterRow"),r=!1,de(t)?ye(e,p,"linePrefix",l.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(t):p(t))}function p(t){return 45===t||58===t?h(t):124===t?(r=!0,e.enter("tableCellDivider"),e.consume(t),e.exit("tableCellDivider"),d):k(t)}function d(t){return de(t)?ye(e,h,"whitespace")(t):h(t)}function h(t){return 58===t?(o+=1,r=!0,e.enter("tableDelimiterMarker"),e.consume(t),e.exit("tableDelimiterMarker"),g):45===t?(o+=1,g(t)):null===t||fe(t)?b(t):k(t)}function g(t){return 45===t?(e.enter("tableDelimiterFiller"),m(t)):k(t)}function m(t){return 45===t?(e.consume(t),m):58===t?(r=!0,e.exit("tableDelimiterFiller"),e.enter("tableDelimiterMarker"),e.consume(t),e.exit("tableDelimiterMarker"),y):(e.exit("tableDelimiterFiller"),y(t))}function y(t){return de(t)?ye(e,b,"whitespace")(t):b(t)}function b(n){return 124===n?p(n):(null===n||fe(n))&&r&&i===o?(e.exit("tableDelimiterRow"),e.exit("tableHead"),t(n)):k(n)}function k(e){return n(e)}function x(t){return e.enter("tableRow"),v(t)}function v(n){return 124===n?(e.enter("tableCellDivider"),e.consume(n),e.exit("tableCellDivider"),v):null===n||fe(n)?(e.exit("tableRow"),t(n)):de(n)?ye(e,v,"whitespace")(n):(e.enter("data"),w(n))}function w(t){return null===t||124===t||pe(t)?(e.exit("data"),v(t)):(e.consume(t),92===t?S:w)}function S(t){return 92===t||124===t?(e.consume(t),w):w(t)}},resolveAll:function(e,t){let n,r,l,i=-1,o=!0,a=0,u=[0,0,0,0],s=[0,0,0,0],c=!1,f=0,p=new Ur;for(;++i<e.length;){let d=e[i],h=d[1];"enter"===d[0]?"tableHead"===h.type?(c=!1,0!==f&&($r(p,t,f,n,r),r=void 0,f=0),n={type:"table",start:Object.assign({},h.start),end:Object.assign({},h.end)},p.add(i,0,[["enter",n,t]])):"tableRow"===h.type||"tableDelimiterRow"===h.type?(o=!0,l=void 0,u=[0,0,0,0],s=[0,i+1,0,0],c&&(c=!1,r={type:"tableBody",start:Object.assign({},h.start),end:Object.assign({},h.end)},p.add(i,0,[["enter",r,t]])),a="tableDelimiterRow"===h.type?2:r?3:1):!a||"data"!==h.type&&"tableDelimiterMarker"!==h.type&&"tableDelimiterFiller"!==h.type?"tableCellDivider"===h.type&&(o?o=!1:(0!==u[1]&&(s[0]=s[1],l=Wr(p,t,u,a,void 0,l)),u=s,s=[u[1],i,0,0])):(o=!1,0===s[2]&&(0!==u[1]&&(s[0]=s[1],l=Wr(p,t,u,a,void 0,l),u=[0,0,0,0]),s[2]=i)):"tableHead"===h.type?(c=!0,f=i):"tableRow"===h.type||"tableDelimiterRow"===h.type?(f=i,0!==u[1]?(s[0]=s[1],l=Wr(p,t,u,a,i,l)):0!==s[1]&&(l=Wr(p,t,s,a,i,l)),a=0):a&&("data"===h.type||"tableDelimiterMarker"===h.type||"tableDelimiterFiller"===h.type)&&(s[3]=i)}for(0!==f&&$r(p,t,f,n,r),p.consume(t.events),i=-1;++i<t.events.length;){let e=t.events[i];"enter"===e[0]&&"table"===e[1].type&&(e[1]._align=qr(t.events,i))}return e}}}};function Wr(e,t,n,r,l,i){let o=1===r?"tableHeader":2===r?"tableDelimiter":"tableData";0!==n[0]&&(i.end=Object.assign({},Qr(t.events,n[0])),e.add(n[0],0,[["exit",i,t]]));let a=Qr(t.events,n[1]);if(i={type:o,start:Object.assign({},a),end:Object.assign({},a)},e.add(n[1],0,[["enter",i,t]]),0!==n[2]){let l=Qr(t.events,n[2]),i=Qr(t.events,n[3]),o={type:"tableContent",start:Object.assign({},l),end:Object.assign({},i)};if(e.add(n[2],0,[["enter",o,t]]),2!==r){let r=t.events[n[2]],l=t.events[n[3]];if(r[1].end=Object.assign({},l[1].end),r[1].type="chunkText",r[1].contentType="text",n[3]>n[2]+1){let t=n[2]+1,r=n[3]-n[2]-1;e.add(t,r,[])}}e.add(n[3]+1,0,[["exit",o,t]])}return void 0!==l&&(i.end=Object.assign({},Qr(t.events,l)),e.add(l,0,[["exit",i,t]]),i=void 0),i}function $r(e,t,n,r,l){let i=[],o=Qr(t.events,n);l&&(l.end=Object.assign({},o),i.push(["exit",l,t])),r.end=Object.assign({},o),i.push(["exit",r,t]),e.add(n+1,0,i)}function Qr(e,t){let n=e[t],r="enter"===n[0]?"start":"end";return n[1][r]}var Yr={text:{91:{tokenize:function(e,t,n){let r=this;return function(t){return null===r.previous&&r._gfmTasklistFirstContentOfListItem?(e.enter("taskListCheck"),e.enter("taskListCheckMarker"),e.consume(t),e.exit("taskListCheckMarker"),l):n(t)};function l(t){return pe(t)?(e.enter("taskListCheckValueUnchecked"),e.consume(t),e.exit("taskListCheckValueUnchecked"),i):88===t||120===t?(e.enter("taskListCheckValueChecked"),e.consume(t),e.exit("taskListCheckValueChecked"),i):n(t)}function i(t){return 93===t?(e.enter("taskListCheckMarker"),e.consume(t),e.exit("taskListCheckMarker"),e.exit("taskListCheck"),o):n(t)}function o(r){return fe(r)?t(r):de(r)?e.check({tokenize:Kr},t,n)(r):n(r)}}}}};function Kr(e,t,n){return ye(e,function(e){return null===e?n(e):t(e)},"whitespace")}function Xr(e,t){let n=String(e);if("string"!=typeof t)throw new TypeError("Expected character");let r=0,l=n.indexOf(t);for(;-1!==l;)r++,l=n.indexOf(t,l+t.length);return r}var Zr={}.hasOwnProperty,Jr=function(e,t,n,r){let l,i;"string"==typeof t||t instanceof RegExp?(i=[[t,n]],l=r):(i=t,l=n),l||(l={});let o=tn(l.ignore||[]),a=function(e){let t=[];if("object"!=typeof e)throw new TypeError("Expected array or object as schema");if(Array.isArray(e)){let n=-1;for(;++n<e.length;)t.push([Gr(e[n][0]),el(e[n][1])])}else{let n;for(n in e)Zr.call(e,n)&&t.push([Gr(n),el(e[n])])}return t}(i),u=-1;for(;++u<a.length;)an(e,"text",s);return e;function s(e,t){let n,r=-1;for(;++r<t.length;){let e=t[r];if(o(e,n?n.children.indexOf(e):void 0,n))return;n=e}if(n)return function(e,t){let n=t[t.length-1],r=a[u][0],l=a[u][1],i=0,o=n.children.indexOf(e),s=!1,c=[];r.lastIndex=0;let f=r.exec(e.value);for(;f;){let n=f.index,o={index:f.index,input:f.input,stack:[...t,e]},a=l(...f,o);if("string"==typeof a&&(a=a.length>0?{type:"text",value:a}:void 0),!1!==a&&(i!==n&&c.push({type:"text",value:e.value.slice(i,n)}),Array.isArray(a)?c.push(...a):a&&c.push(a),i=n+f[0].length,s=!0),!r.global)break;f=r.exec(e.value)}return s?(i<e.value.length&&c.push({type:"text",value:e.value.slice(i)}),n.children.splice(o,1,...c)):c=[e],o+c.length}(e,t)}};function Gr(e){return"string"==typeof e?new RegExp(function(e){if("string"!=typeof e)throw new TypeError("Expected a string");return e.replace(/[|\\{}()[\]^$+*?.]/g,"\\$&").replace(/-/g,"\\x2d")}(e),"g"):e}function el(e){return"function"==typeof e?e:()=>e}var tl="phrasing",nl=["autolink","link","image","label"],rl={transforms:[function(e){Jr(e,[[/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi,ol],[/([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/g,al]],{ignore:["link","linkReference"]})}],enter:{literalAutolink:function(e){this.enter({type:"link",title:null,url:"",children:[]},e)},literalAutolinkEmail:il,literalAutolinkHttp:il,literalAutolinkWww:il},exit:{literalAutolink:function(e){this.exit(e)},literalAutolinkEmail:function(e){this.config.exit.autolinkEmail.call(this,e)},literalAutolinkHttp:function(e){this.config.exit.autolinkProtocol.call(this,e)},literalAutolinkWww:function(e){this.config.exit.data.call(this,e),this.stack[this.stack.length-1].url="http://"+this.sliceSerialize(e)}}},ll={unsafe:[{character:"@",before:"[+\\-.\\w]",after:"[\\-.\\w]",inConstruct:tl,notInConstruct:nl},{character:".",before:"[Ww]",after:"[\\-.\\w]",inConstruct:tl,notInConstruct:nl},{character:":",before:"[ps]",after:"\\/",inConstruct:tl,notInConstruct:nl}]};function il(e){this.config.enter.autolinkProtocol.call(this,e)}function ol(e,t,n,r,l){let i="";if(!ul(l)||(/^w/i.test(t)&&(n=t+n,t="",i="http://"),!function(e){let t=e.split(".");return!(t.length<2||t[t.length-1]&&(/_/.test(t[t.length-1])||!/[a-zA-Z\d]/.test(t[t.length-1]))||t[t.length-2]&&(/_/.test(t[t.length-2])||!/[a-zA-Z\d]/.test(t[t.length-2])))}(n)))return!1;let o=function(e){let t=/[!"&'),.:;<>?\]}]+$/.exec(e);if(!t)return[e,void 0];e=e.slice(0,t.index);let n=t[0],r=n.indexOf(")"),l=Xr(e,"("),i=Xr(e,")");for(;-1!==r&&l>i;)e+=n.slice(0,r+1),n=n.slice(r+1),r=n.indexOf(")"),i++;return[e,n]}(n+r);if(!o[0])return!1;let a={type:"link",title:null,url:i+t+o[0],children:[{type:"text",value:t+o[0]}]};return o[1]?[a,{type:"text",value:o[1]}]:a}function al(e,t,n,r){return!(!ul(r,!0)||/[-\d_]$/.test(n))&&{type:"link",title:null,url:"mailto:"+t+"@"+n,children:[{type:"text",value:t+"@"+n}]}}function ul(e,t){let n=e.input.charCodeAt(e.index-1);return(0===e.index||ge(n)||he(n))&&(!t||47!==n)}function sl(e){return e.label||!e.identifier?e.label||"":Mt(e.identifier)}function cl(e,t,n,r){let l=r.join.length;for(;l--;){let i=r.join[l](e,t,n,r);if(!0===i||1===i)break;if("number"==typeof i)return"\n".repeat(1+i);if(!1===i)return"\n\n\x3c!----\x3e\n\n"}return"\n\n"}var fl=/\r?\n|\r/g;function pl(e){if(!e._compiled){let t=(e.atBreak?"[\\r\\n][\\t ]*":"")+(e.before?"(?:"+e.before+")":"");e._compiled=new RegExp((t?"("+t+")":"")+(/[|\\{}()[\]^$+*?.-]/.test(e.character)?"\\":"")+e.character+(e.after?"(?:"+e.after+")":""),"g")}return e._compiled}function dl(e,t){return hl(e,t.inConstruct,!0)&&!hl(e,t.notInConstruct,!1)}function hl(e,t,n){if("string"==typeof t&&(t=[t]),!t||0===t.length)return n;let r=-1;for(;++r<t.length;)if(e.includes(t[r]))return!0;return!1}function gl(e,t,n){let r=(n.before||"")+(t||"")+(n.after||""),l=[],i=[],o={},a=-1;for(;++a<e.unsafe.length;){let t=e.unsafe[a];if(!dl(e.stack,t))continue;let n,i=pl(t);for(;n=i.exec(r);){let e="before"in t||!!t.atBreak,r="after"in t,i=n.index+(e?n[1].length:0);l.includes(i)?(o[i].before&&!e&&(o[i].before=!1),o[i].after&&!r&&(o[i].after=!1)):(l.push(i),o[i]={before:e,after:r})}}l.sort(ml);let u=n.before?n.before.length:0,s=r.length-(n.after?n.after.length:0);for(a=-1;++a<l.length;){let e=l[a];e<u||e>=s||e+1<s&&l[a+1]===e+1&&o[e].after&&!o[e+1].before&&!o[e+1].after||l[a-1]===e-1&&o[e].before&&!o[e-1].before&&!o[e-1].after||(u!==e&&i.push(yl(r.slice(u,e),"\\")),u=e,!/[!-/:-@[-`{-~]/.test(r.charAt(e))||n.encode&&n.encode.includes(r.charAt(e))?(i.push("&#x"+r.charCodeAt(e).toString(16).toUpperCase()+";"),u++):i.push("\\"))}return i.push(yl(r.slice(u,s),n.after)),i.join("")}function ml(e,t){return e-t}function yl(e,t){let n,r=/\\(?=[!-/:-@[-`{-~])/g,l=[],i=[],o=e+t,a=-1,u=0;for(;n=r.exec(o);)l.push(n.index);for(;++a<l.length;)u!==l[a]&&i.push(e.slice(u,l[a])),i.push("\\"),u=l[a];return i.push(e.slice(u)),i.join("")}function bl(e){let t=e||{},n=t.now||{},r=t.lineShift||0,l=n.line||1,i=n.column||1;return{move:function(e){let t=e||"",n=t.split(/\r?\n|\r/g),o=n[n.length-1];return l+=n.length-1,i=1===n.length?i+o.length:1+o.length+r,t},current:function(){return{now:{line:l,column:i},lineShift:r}},shift:function(e){r+=e}}}function kl(e){this.enter({type:"footnoteDefinition",identifier:"",label:"",children:[]},e)}function xl(){this.buffer()}function vl(e){let t=this.resume(),n=this.stack[this.stack.length-1];n.label=t,n.identifier=We(this.sliceSerialize(e)).toLowerCase()}function wl(e){this.exit(e)}function Sl(e){this.enter({type:"footnoteReference",identifier:"",label:""},e)}function Cl(){this.buffer()}function El(e){let t=this.resume(),n=this.stack[this.stack.length-1];n.label=t,n.identifier=We(this.sliceSerialize(e)).toLowerCase()}function Fl(e){this.exit(e)}function Al(e,t,n,i){let o=bl(i),a=o.move("[^"),u=n.enter("footnoteReference"),s=n.enter("reference");return a+=o.move(gl(n,sl(e),r(l({},o.current()),{before:a,after:"]"}))),s(),u(),a+=o.move("]"),a}function Dl(e,t,n,i){let o=bl(i),a=o.move("[^"),u=n.enter("footnoteDefinition"),s=n.enter("label");return a+=o.move(gl(n,sl(e),r(l({},o.current()),{before:a,after:"]"}))),s(),a+=o.move("]:"+(e.children&&e.children.length>0?" ":"")),o.shift(4),a+=o.move(function(e,t){let n,r=[],l=0,i=0;for(;n=fl.exec(e);)o(e.slice(l,n.index)),r.push(n[0]),l=n.index+n[0].length,i++;return o(e.slice(l)),r.join("");function o(e){r.push(t(e,i,!e))}}(function(e,t,n){let r=t.indexStack,i=e.children||[],o=t.createTracker(n),a=[],u=-1;for(r.push(-1);++u<i.length;){let n=i[u];r[r.length-1]=u,a.push(o.move(t.handle(n,e,t,l({before:"\n",after:"\n"},o.current())))),"list"!==n.type&&(t.bulletLastUsed=void 0),u<i.length-1&&a.push(o.move(cl(n,i[u+1],e,t)))}return r.pop(),a.join("")}(e,n,o.current()),Tl)),u(),a}function Tl(e,t,n){return 0===t?e:(n?"":"    ")+e}function Ol(e,t,n){let i=t.indexStack,o=e.children||[],a=[],u=-1,s=n.before;i.push(-1);let c=t.createTracker(n);for(;++u<o.length;){let f,p=o[u];if(i[i.length-1]=u,u+1<o.length){let n=t.handle.handlers[o[u+1].type];n&&n.peek&&(n=n.peek),f=n?n(o[u+1],e,t,l({before:"",after:""},c.current())).charAt(0):""}else f=n.after;a.length>0&&("\r"===s||"\n"===s)&&"html"===p.type&&(a[a.length-1]=a[a.length-1].replace(/(\r?\n|\r)$/," "),s=" ",c=t.createTracker(n),c.move(a.join(""))),a.push(c.move(t.handle(p,e,t,r(l({},c.current()),{before:s,after:f})))),s=a[a.length-1].slice(-1)}return i.pop(),a.join("")}Al.peek=function(){return"["};Il.peek=function(){return"~"};var Ll={canContainEols:["delete"],enter:{strikethrough:function(e){this.enter({type:"delete",children:[]},e)}},exit:{strikethrough:function(e){this.exit(e)}}},Pl={unsafe:[{character:"~",inConstruct:"phrasing",notInConstruct:["autolink","destinationLiteral","destinationRaw","reference","titleQuote","titleApostrophe"]}],handlers:{delete:Il}};function Il(e,t,n,i){let o=bl(i),a=n.enter("strikethrough"),u=o.move("~~");return u+=Ol(e,n,r(l({},o.current()),{before:u,after:"~"})),u+=o.move("~~"),a(),u}function zl(e,t,n){let r=e.value||"",l="`",i=-1;for(;new RegExp("(^|[^`])"+l+"([^`]|$)").test(r);)l+="`";for(/[^ \r\n]/.test(r)&&(/^[ \r\n]/.test(r)&&/[ \r\n]$/.test(r)||/^`|`$/.test(r))&&(r=" "+r+" ");++i<n.unsafe.length;){let e,t=n.unsafe[i],l=pl(t);if(t.atBreak)for(;e=l.exec(r);){let t=e.index;10===r.charCodeAt(t)&&13===r.charCodeAt(t-1)&&t--,r=r.slice(0,t)+" "+r.slice(e.index+1)}}return l+r+l}function Ml(e){return null==e?"":String(e)}function Rl(e){return e.length}function jl(e){let t="string"==typeof e?e.codePointAt(0):0;return 67===t||99===t?99:76===t||108===t?108:82===t||114===t?114:0}zl.peek=function(){return"`"};var _l={enter:{table:function(e){let t=e._align;this.enter({type:"table",align:t.map(e=>"none"===e?null:e),children:[]},e),this.setData("inTable",!0)},tableData:Nl,tableHeader:Nl,tableRow:function(e){this.enter({type:"tableRow",children:[]},e)}},exit:{codeText:function(e){let t=this.resume();this.getData("inTable")&&(t=t.replace(/\\([\\|])/g,Hl)),this.stack[this.stack.length-1].value=t,this.exit(e)},table:function(e){this.exit(e),this.setData("inTable")},tableData:Bl,tableHeader:Bl,tableRow:Bl}};function Bl(e){this.exit(e)}function Nl(e){this.enter({type:"tableCell",children:[]},e)}function Hl(e,t){return"|"===t?t:e}function Ul(e){let t=e||{},n=t.tableCellPadding,i=t.tablePipeAlign,o=t.stringLength,a=n?" ":"|";return{unsafe:[{character:"\r",inConstruct:"tableCell"},{character:"\n",inConstruct:"tableCell"},{atBreak:!0,character:"|",after:"[\t :-]"},{character:"|",inConstruct:"tableCell"},{atBreak:!0,character:":",after:"-"},{atBreak:!0,character:"-",after:"[:|-]"}],handlers:{table:function(e,t,n,r){return s(function(e,t,n){let r=e.children,l=-1,i=[],o=t.enter("table");for(;++l<r.length;)i[l]=c(r[l],t,n);return o(),i}(e,n,r),e.align)},tableRow:function(e,t,n,r){let l=s([c(e,n,r)]);return l.slice(0,l.indexOf("\n"))},tableCell:u,inlineCode:function(e,t,n){let r=zl(e,0,n);return n.stack.includes("tableCell")&&(r=r.replace(/\|/g,"\\$&")),r}}};function u(e,t,n,i){let o=n.enter("tableCell"),u=n.enter("phrasing"),s=Ol(e,n,r(l({},i),{before:a,after:a}));return u(),o(),s}function s(e,t){return function(e,t={}){let n=(t.align||[]).concat(),r=t.stringLength||Rl,l=[],i=[],o=[],a=[],u=0,s=-1;for(;++s<e.length;){let n=[],l=[],c=-1;for(e[s].length>u&&(u=e[s].length);++c<e[s].length;){let i=Ml(e[s][c]);if(!1!==t.alignDelimiters){let e=r(i);l[c]=e,(void 0===a[c]||e>a[c])&&(a[c]=e)}n.push(i)}i[s]=n,o[s]=l}let c=-1;if("object"==typeof n&&"length"in n)for(;++c<u;)l[c]=jl(n[c]);else{let e=jl(n);for(;++c<u;)l[c]=e}c=-1;let f=[],p=[];for(;++c<u;){let e=l[c],n="",r="";99===e?(n=":",r=":"):108===e?n=":":114===e&&(r=":");let i=!1===t.alignDelimiters?1:Math.max(1,a[c]-n.length-r.length),o=n+"-".repeat(i)+r;!1!==t.alignDelimiters&&(i=n.length+i+r.length,i>a[c]&&(a[c]=i),p[c]=i),f[c]=o}i.splice(1,0,f),o.splice(1,0,p),s=-1;let d=[];for(;++s<i.length;){let e=i[s],n=o[s];c=-1;let r=[];for(;++c<u;){let i=e[c]||"",o="",s="";if(!1!==t.alignDelimiters){let e=a[c]-(n[c]||0),t=l[c];114===t?o=" ".repeat(e):99===t?e%2?(o=" ".repeat(e/2+.5),s=" ".repeat(e/2-.5)):(o=" ".repeat(e/2),s=o):s=" ".repeat(e)}!1!==t.delimiterStart&&!c&&r.push("|"),!1!==t.padding&&!(!1===t.alignDelimiters&&""===i)&&(!1!==t.delimiterStart||c)&&r.push(" "),!1!==t.alignDelimiters&&r.push(o),r.push(i),!1!==t.alignDelimiters&&r.push(s),!1!==t.padding&&r.push(" "),(!1!==t.delimiterEnd||c!==u-1)&&r.push("|")}d.push(!1===t.delimiterEnd?r.join("").replace(/ +$/,""):r.join(""))}return d.join("\n")}(e,{align:t,alignDelimiters:i,padding:n,stringLength:o})}function c(e,t,n){let r=e.children,l=-1,i=[],o=t.enter("tableRow");for(;++l<r.length;)i[l]=u(r[l],0,t,n);return o(),i}}function ql(e,t,n,r){let l=function(e){let t=e.options.listItemIndent||"tab";if(1===t||"1"===t)return"one";if("tab"!==t&&"one"!==t&&"mixed"!==t)throw new Error("Cannot serialize items with `"+t+"` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`");return t}(n),i=n.bulletCurrent||function(e){let t=e.options.bullet||"*";if("*"!==t&&"+"!==t&&"-"!==t)throw new Error("Cannot serialize items with `"+t+"` for `options.bullet`, expected `*`, `+`, or `-`");return t}(n);t&&"list"===t.type&&t.ordered&&(i=("number"==typeof t.start&&t.start>-1?t.start:1)+(!1===n.options.incrementListMarker?0:t.children.indexOf(e))+i);let o=i.length+1;("tab"===l||"mixed"===l&&(t&&"list"===t.type&&t.spread||e.spread))&&(o=4*Math.ceil(o/4));let a=n.createTracker(r);a.move(i+" ".repeat(o-i.length)),a.shift(o);let u=n.enter("listItem"),s=n.indentLines(n.containerFlow(e,a.current()),function(e,t,n){return t?(n?"":" ".repeat(o))+e:(n?i:i+" ".repeat(o-i.length))+e});return u(),s}var Vl={exit:{taskListCheckValueChecked:$l,taskListCheckValueUnchecked:$l,paragraph:function(e){let t=this.stack[this.stack.length-2];if(t&&"listItem"===t.type&&"boolean"==typeof t.checked){let e=this.stack[this.stack.length-1],n=e.children[0];if(n&&"text"===n.type){let r,l=t.children,i=-1;for(;++i<l.length;){let e=l[i];if("paragraph"===e.type){r=e;break}}r===e&&(n.value=n.value.slice(1),0===n.value.length?e.children.shift():e.position&&n.position&&"number"==typeof n.position.start.offset&&(n.position.start.column++,n.position.start.offset++,e.position.start=Object.assign({},n.position.start)))}}this.exit(e)}}},Wl={unsafe:[{atBreak:!0,character:"-",after:"[:|-]"}],handlers:{listItem:function(e,t,n,r){let i=e.children[0],o="boolean"==typeof e.checked&&i&&"paragraph"===i.type,a="["+(e.checked?"x":" ")+"] ",u=bl(r);o&&u.move(a);let s=ql(e,t,n,l(l({},r),u.current()));return o&&(s=s.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/,function(e){return e+a})),s}}};function $l(e){this.stack[this.stack.length-2].checked="taskListCheckValueChecked"===e.type}function Ql(e={}){let t=this.data();function n(e,n){(t[e]?t[e]:t[e]=[]).push(n)}n("micromarkExtensions",function(e){return te([Ar,{document:{91:{tokenize:_r,continuation:{tokenize:Br},exit:Nr}},text:{91:{tokenize:jr},93:{add:"after",tokenize:Mr,resolveTo:Rr}}},Hr(e),Vr,Yr])}(e)),n("fromMarkdownExtensions",[rl,{enter:{gfmFootnoteDefinition:kl,gfmFootnoteDefinitionLabelString:xl,gfmFootnoteCall:Sl,gfmFootnoteCallString:Cl},exit:{gfmFootnoteDefinition:wl,gfmFootnoteDefinitionLabelString:vl,gfmFootnoteCall:Fl,gfmFootnoteCallString:El}},Ll,_l,Vl]),n("toMarkdownExtensions",function(e){return{extensions:[ll,{unsafe:[{character:"[",inConstruct:["phrasing","label","reference"]}],handlers:{footnoteDefinition:Dl,footnoteReference:Al}},Pl,Ul(e),Wl]}}(e))}var Yl=e(t(),1);function Kl(e){return Yl.default.createElement("a",{href:e.href,target:"_blank",rel:"noreferrer"},e.children)}function Xl({source:e}){return Yl.default.createElement(yr,{components:{a:Kl},rehypePlugins:[Ql]},e)}
/*! Bundled license information:

is-buffer/index.js:
  (*!
   * Determine if an object is a Buffer
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)
*/export{Xl as default};
