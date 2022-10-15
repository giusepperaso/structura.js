# Contributing

Before creating a pull request, be sure that tests are not failing, and that the performance did not degrade (unless there is a very good reason for the slow down).

To run tests:

```bash
npm run test
```

To run benchmarks:

```bash
npm run benchmark
```

If you want to try the library into the browser, create a copy of *src/dev.example.ts* and rename it *src/dev.ts* (this file will be gitignored)

Then to run it:
```bash
npm run dev
```