# TDD

In this module we're going to refactor the code a bit and add a search feature.

Now that we have tests we can safely proceed in the knowledge that if we break 
anything our tooling will tell us right away!

## Step 1: Adapt existing functionality

- Our app is looking nice but it's very inflexible
- As part of a series of improvements We're going to extract configuration from 
  the script so that it's easier to customise

## Step 2: Add a new feature:

- Add a search bar that lets us search for a particular city
- Because we're using Test _Driven_ Development we're going to write the test 
  first, have it fail and then add the necessary features & constraints that 
  satisfy the rules we've set