import{ax as c}from"./index-CVZjuLi7.js";function y(t,l){var e=typeof Symbol<"u"&&t[Symbol.iterator]||t["@@iterator"];if(!e){if(Array.isArray(t)||(e=c(t))||l){e&&(t=e);var o=0,a=function(){};return{s:a,n:function(){return o>=t.length?{done:!0}:{done:!1,value:t[o++]}},e:function(n){throw n},f:a}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var u,i=!0,f=!1;return{s:function(){e=e.call(t)},n:function(){var n=e.next();return i=n.done,n},e:function(n){f=!0,u=n},f:function(){try{i||e.return==null||e.return()}finally{if(f)throw u}}}}export{y as _};
