# Advent of Code 2021

> 12am is real programmer hours

My solutions for [Advent of Code 2021](https://adventofcode.com/2021), written up in [Typescript](https://www.typescriptlang.org/).

Overengineered with [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) setup so my code looks okay while I hack together solutions.

[ts-node](https://typestrong.org/ts-node/) and [Nodemon](https://nodemon.io/) are there too to run solutions on save for maximized efficiency (the solutions themselves are not very efficient, to remain somewhat readable.)

(This also serves as a minimal template for Typescript/Prettier/ESLint if you want.)

## Running a solution

```sh
# Don't forget this
npm install

# Run a solution once
npx ts-node src/day1/p1.ts

# Run a solution and watch for changes
npx nodemon src/day1/p1.ts
```

## Using as a template

The emitted code (by default) is ESNext module code, which will require a relatively recent Nodejs version (v12 or later.) You can read more about it on [Typescript's changelog](https://devblogs.microsoft.com/typescript/announcing-typescript-4-5-beta/#esm-nodejs).

## License

It's MIT
