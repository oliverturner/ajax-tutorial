What we're going to build: https://codebar.oliverturner.cloud/

![Screenshot](public/assets/images/codebar.oliverturner.cloud_.png?raw=true "Meteoropolis")

Meteoropolis is a small application that tells you the current weather for a 
city from OpenWeatherMap and displays images relevant to that weather (sadly not 
always the location!) from Unsplash.

A slideshow giving a overview can be seen here http://slides.com/oliverturner/api-tutorial

_NOTE: This is a collaborative work in progress! PRs welcome!_

## How we're going to build it

This is a multi-stage tutorial that takes our app from an ES5 monolith to a 
properly-architected, fully tested, continuously deployed and integrated modern 
(ES2016) application

### Step 1: API access & rendering
- Build a vanilla ES5 app as a monolith
- Use the Fetch API and therefore Promises to retrieve data and render it

### Step 2: Testing
- Set up automation to test and develop
- Unit testing with Jest
- Integration / E2E testing with Puppeteer

### Step 3: Architecture
- Separate our concerns by break our Monolith into Components
- Move the app to ES6 syntax as we go

### Step 4: PWA
- Use Workbox to make our app performant and resilient

### Step 5: Deployment
- Set up Continuous Integration & Deployment (CI & CD)
- Integrate with the Now service from [Zeit](http://zeit.co) to deploy our application