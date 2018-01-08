
# Step 3: Adding tests

In this step we're going to give ourselves a huge productivity boost: we're 
going to set up our test harness!

It may sound counterintuitive that by giving ourselves extra tasks we'll get 
more done, but, as we'll see, automated tests are the best way to go fast and 
add new features without the risk of costly regressions.

## New features

Looking at our project folder, we can see a few additions: a folder called 
`./cypress` and a file called `package.json` (which will look familiar to you if 
you've looked at any Node projects before). To use them we need to make sure we 
have a current version of Node installed and then run 

```npm i``` 

(short for `npm install`) in order to pull in the packages listed in the 
`devDependencies` section of `package.json`

Once we've done that we'll have access to 3 new capabilities: 

- `npm start`: runs a local server for us to develop against
- `npm test`: executes the tests we've written in `./cypress/integration/*_spec.js`
- `npm run prettify`: formats our code automatically using [Prettier](https://prettier.io/)

There are additional packages too:

- `husky`, runs tasks automatically when we commit our code to Git. Since one 
  task is `npm test`, this gives us some extra security because now we can't 
  inadvertently commit broken code.
- `lint-staged` is another task run by Husky: it runs its own subtasks. The key 
  thing about it is that it only looks at the files that have _changed_ since 
  last commit: this keeps things nice and quick


