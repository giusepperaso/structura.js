# Benchmarks

Click on any image to zoom it in a new tab.

The bars are referred respectively to those libraries:

1) *Structura* - no optimizations
2) *Immer* - optimizations: without autofreeze, maps, sets and patches
3) *Immutable* - optimizations: without calling toJS/fromJS, which are slow

**The higher and greener the bar, the better.**

The benchmarks were performed on a machine with these specs:

>CPU: Intel(R) Core(TM) i7-8750H @ 2.20GHz

>RAM: 32GB 

>OS: Windows 10

## Complex object, few modifications

<a href="https://github.com/GiuseppeRaso/structura.js/raw/master/docs/pics/benchmarks/wide_few.png" target="_blank">
<img src="https://github.com/GiuseppeRaso/structura.js/raw/master/docs/pics/benchmarks/wide_few.png" style="background:white;" />
</a>

## Complex object, many modifications

<a href="https://github.com/GiuseppeRaso/structura.js/raw/master/docs/pics/benchmarks/wide_many.png" target="_blank">
<img src="https://github.com/GiuseppeRaso/structura.js/raw/master/docs/pics/benchmarks/wide_many.png" style="background:white;" />
</a>

## Nested object, few modifications

<a href="https://github.com/GiuseppeRaso/structura.js/raw/master/docs/pics/benchmarks/nested_few.png" target="_blank">
<img src="https://github.com/GiuseppeRaso/structura.js/raw/master/docs/pics/benchmarks/nested_few.png" style="background:white;" />
</a>

## Nested object, many modifications

<a href="https://github.com/GiuseppeRaso/structura.js/raw/master/docs/pics/benchmarks/nested_many.png" target="_blank">
<img src="https://github.com/GiuseppeRaso/structura.js/raw/master/docs/pics/benchmarks/nested_many.png" style="background:white;" />
</a>

## Simple object, few modifications

<a href="https://github.com/GiuseppeRaso/structura.js/raw/master/docs/pics/benchmarks/small_few.png" target="_blank">
<img src="https://github.com/GiuseppeRaso/structura.js/raw/master/docs/pics/benchmarks/small_few.png" style="background:white;" />
</a>

## Simple object, many modifications

<a href="https://github.com/GiuseppeRaso/structura.js/raw/master/docs/pics/benchmarks/small_many.png" target="_blank">
<img src="https://github.com/GiuseppeRaso/structura.js/raw/master/docs/pics/benchmarks/small_many.png" style="background:white;" />
</a>

