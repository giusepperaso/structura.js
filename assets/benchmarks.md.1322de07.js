import{_ as e,c as i,o as t,a}from"./app.5909c5c4.js";const o="/assets/wide_few.67465eee.png",n="/assets/wide_many.e9464c2a.png",s="/assets/nested_few.54b63840.png",c="/assets/nested_many.b57b32d7.png",m="/assets/small_few.d67197d6.png",r="/assets/small_many.b70ad3f4.png",u=JSON.parse('{"title":"Benchmarks","description":"","frontmatter":{},"headers":[{"level":2,"title":"Complex object, few modifications","slug":"complex-object-few-modifications","link":"#complex-object-few-modifications","children":[]},{"level":2,"title":"Complex object, many modifications","slug":"complex-object-many-modifications","link":"#complex-object-many-modifications","children":[]},{"level":2,"title":"Nested object, few modifications","slug":"nested-object-few-modifications","link":"#nested-object-few-modifications","children":[]},{"level":2,"title":"Nested object, many modifications","slug":"nested-object-many-modifications","link":"#nested-object-many-modifications","children":[]},{"level":2,"title":"Simple object, few modifications","slug":"simple-object-few-modifications","link":"#simple-object-few-modifications","children":[]},{"level":2,"title":"Simple object, many modifications","slug":"simple-object-many-modifications","link":"#simple-object-many-modifications","children":[]}],"relativePath":"benchmarks.md"}'),d={name:"benchmarks.md"},l=a('<h1 id="benchmarks" tabindex="-1">Benchmarks <a class="header-anchor" href="#benchmarks" aria-hidden="true">#</a></h1><p>Click on any image to zoom it in a new tab.</p><p>The bars are referred respectively to those libraries:</p><ol><li><em>Structura</em> - no optimizations</li><li><em>Immer</em> - optimizations: without autofreeze, maps, sets and patches</li><li><em>Immutable</em> - optimizations: without calling toJS/fromJS, which are slow</li></ol><p><strong>The higher and greener the bar, the better.</strong></p><p>The benchmarks were performed on a machine with these specs:</p><blockquote><p>CPU: Intel(R) Core(TM) i7-8750H @ 2.20GHz</p></blockquote><blockquote><p>RAM: 32GB</p></blockquote><blockquote><p>OS: Windows 10)</p></blockquote><h2 id="complex-object-few-modifications" tabindex="-1">Complex object, few modifications <a class="header-anchor" href="#complex-object-few-modifications" aria-hidden="true">#</a></h2><a href="/pics/benchmarks/wide_few.png" target="_blank"><img src="'+o+'" style="background:white;"></a><h2 id="complex-object-many-modifications" tabindex="-1">Complex object, many modifications <a class="header-anchor" href="#complex-object-many-modifications" aria-hidden="true">#</a></h2><a href="/pics/benchmarks/wide_many.png" target="_blank"><img src="'+n+'" style="background:white;"></a><h2 id="nested-object-few-modifications" tabindex="-1">Nested object, few modifications <a class="header-anchor" href="#nested-object-few-modifications" aria-hidden="true">#</a></h2><a href="/pics/benchmarks/nested_few.png" target="_blank"><img src="'+s+'" style="background:white;"></a><h2 id="nested-object-many-modifications" tabindex="-1">Nested object, many modifications <a class="header-anchor" href="#nested-object-many-modifications" aria-hidden="true">#</a></h2><a href="/pics/benchmarks/nested_many.png" target="_blank"><img src="'+c+'" style="background:white;"></a><h2 id="simple-object-few-modifications" tabindex="-1">Simple object, few modifications <a class="header-anchor" href="#simple-object-few-modifications" aria-hidden="true">#</a></h2><a href="/pics/benchmarks/small_few.png" target="_blank"><img src="'+m+'" style="background:white;"></a><h2 id="simple-object-many-modifications" tabindex="-1">Simple object, many modifications <a class="header-anchor" href="#simple-object-many-modifications" aria-hidden="true">#</a></h2><a href="/pics/benchmarks/small_many.png" target="_blank"><img src="'+r+'" style="background:white;"></a>',21),h=[l];function f(b,p,_,g,w,k){return t(),i("div",null,h)}const y=e(d,[["render",f]]);export{u as __pageData,y as default};
