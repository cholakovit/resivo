# dormakaba resivo coding challenge

Welcome to our coding challenge. This is your opportunity to showcase your development skills and demonstrate your thought process, implementation steps, and delivery quality. We're excited to review your work.

## Scenario

dormakaba specializes in creating dependable, secure, and seamlessly integrable digital access solutions. This challenge offers a glimpse into the typical tasks you'd encounter in our day-to-day operations.

To immerse yourself in the scenario, envision being a part of our team. We've recently initiated a new project, established the fundamental boilerplate, and are gearing up to implement the initial user features. 

Your task is to contribute to this exciting venture by simulating the following use case:

* Our users can register PIN codes for arbitrary doors in our system.
* A PIN registration specifies
    * the PIN ;)
    * the doors at which that PIN should work
    * optionally restrictions that indicate when the PIN code should be valid.
      * No restrictions means 24/7.
      * Only end date means the PIN will be valid immediately.
      * Only start date means the PIN never expires.
       

So basically, if I register the PIN `1234` for the `garage` door, I should
be able to enter through that door using this PIN. If that PIN only works today,
I shouldn't be able to enter anymore as of tomorrow.
Try to think of a door entry as some sort of simulated hardware that has a whitelist
of authorized PINs, which you would update through some sort of IoT stack.
Here's an example of our PIN reader: https://www.dormakaba.com/ch-en/offering/products/electronic-access-data/card-readers-peripherals/dormakaba-compact-reader-91-12--dk_4

We are not providing a lot of context here: Think about the business
case, and make good decisions in your overall implementation.
Of course, your code should have production grade quality: Show us what you can do :)
If you happen to take a shortcut, assumption, or do a simplification, please justify
as a comment in your code.

The challenge consists of two parts:

### Pin Code Registration

The `PinCodeRegistrationController` class declares endpoints that
allow our users to create / update / delete PIN code registrations.
Note that we'll use the PIN code itself as an identifier here for
the update (which is a code smell, but we'd like you to make it work).


### Access Validation

The `AccessRequestController` class only exposes a single endpoint.
We will use it to simulate the use case of somebody

* entering a specific PIN code
* at a specific door
* at a specific date / time

We sort of simulate an IoT stack here: This endpoint should indicate
whether the door would open or not based on the user input and your
current PIN code registrations.

## Technical Details

### Boilerplate Code

This NestJS template runs out of the box, and we are providing 
controllers, repository classes, a simulated database
and some fixed test data for doors and users.

The application should start without errors, and offer you Swagger
docs under http://localhost:3000/api

Everything in the `Boilerplate` folder shouldn't be changed (unless
you have a good reason - if yes, please justify). Focus on
implementing the business logic instead.

Also, please **do not change the controllers** apart from the returned
data - this will simplify testing for us.

### Doors

We assume a fixed set of doors, that are available through the `DoorService` /
`DoorRepository` classes. You can use the following door IDs (please don't change them):

* `main`
* `garage`
* `spa`
* `gym`

### Authentication

We do not provide a login endpoint or anything, and we also don't need one.
In order to keep things simple, just submit a user ID through an HTTP
`x-user-id` header to simulate a logged-in user.
The controllers will resolve the user ID for you, and also return 
an HTTP 403 if the header is missing.

You can use the provided `UserService` in order to get a user object for
a given user ID.
You can use the following user IDs (please don't change them):

* `peter`
* `wanda`
* `thor`
* `groot`

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

