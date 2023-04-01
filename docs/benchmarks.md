# Benchmarks

Click on any image to see the respective chart in a new tab.

The bars are referred respectively to those libraries:

1) *Structura* - with or without strict copy (maps, sets and patches are always enabled)
2) *Immer* - with or without autofreeze (maps, sets and patches are always disabled)
3) *Immutable* - with or without calling toJS (fromJS is never used)

**The higher and greener the bar, the better.**

The benchmarks were performed on a machine with these specs:

>CPU: Intel(R) Core(TM) i7-8750H @ 2.20GHz

>RAM: 32GB 

>OS: Windows 10

## Complex object, many modifications

<a href="./benchmark/wide_many.chart.html" target="_blank">
<img src="/benchmark/wide_many.jpg" style="background:white;" />
</a>

## Complex object, few modifications

<a href="./benchmark/wide_few.chart.html" target="_blank">
<img src="/benchmark/wide_few.jpg" style="background:white;" />
</a>

## Nested object, many modifications

<a href="./benchmark/nested_many.chart.html" target="_blank">
<img src="/benchmark/nested_many.jpg" style="background:white;" />
</a>

## Nested object, few modifications

<a href="./benchmark/nested_few.chart.chart.html" target="_blank">
<img src="/benchmark/nested_few.jpg" style="background:white;" />
</a>

## Simple object, many modifications

<a href="./benchmark/small_many.chart.html" target="_blank">
<img src="/benchmark/small_many.jpg" style="background:white;" />
</a>

## Simple object, few modifications

<a href="./benchmark/small_few.chart.html" target="_blank">
<img src="/benchmark/small_few.jpg" style="background:white;" />
</a>