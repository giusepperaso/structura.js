# Contributing

Before creating a pull request, be sure that tests are not failing, and that the performance did not degrade (unless there is a very good reason for the slow down).

## Basics

Git clone the repo and run npm install (the install will be heavier than that of the published package because of dev dependencies)

If you want to be sure that you have the necessary node version installed, use *Volta*:

```bash
curl https://get.volta.sh | bash
```

More details here: [https://volta.sh/](https://volta.sh/)

## To run tests:

```bash
npm run test
```

This will also create coverage

## To run benchmarks:

```bash
npm run benchmark
```

**This will also create screenshots of the benchmarks and will copy the same files into the docs folder.**

If you want to only run benchmarks and nothing else:

```bash
npm run benchmark:only
```

## To run it into the browser

If you want to try the library into the browser, create a copy of *src/dev.example.ts* and rename it *src/dev.ts* (this file will be gitignored)

Then to run it:
```bash
npm run dev
```
