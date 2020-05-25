---
title: Advanced internationalization with Vuex
image: '/images/advanced-internationalization-with-vuex/advanced-internationalization-with-vuex.png'
tags: [php, laravel, javascript, vuejs, vuex, internationalization]
description: Battle tested principles and code architecture for internationalization on Vuex.
excerpt: Battle tested principles and code architecture for internationalization on Vuex.
date: 2019-06-29
---

> The code samples used in this article are written in Laravel (PHP) and adapted for Vue.js, but the techniques can be applied easily on any technologies.

<br>
Let's face it, internationalization can be cumbersome.

When working on web applications, translation strings are typically stored in the backend of your app while they're mostly used in the frontend. This is the main challenge because you need to communicate the translations from your backend to your frontend code.

I've tried multiple approaches like passing the translation as component's props but ultimately went with AJAX calls:

* It's easy to use and flexible
* The browser only loads the necessary translations
* Translation strings are easily cached and versioned.
* Handle concurrency between two components that load the same translations

I will show you how to build a powerful translation system for your app that can scale easily with only a few lines of codes.

## Rules before we get started

I tried to follow some principle when working on translation strings, they may not be adapted following how you structure your project but this is how I do it:

#### Snake case

Always use `snake_case` when naming my strings, because using `kebab-case` is not as elegant in javascript:

```javascript
trans.success_message
// vs
trans['success-message']
```

#### Think reusability

You probably don't need to translate "Submit", "Close", "Send", "View" or other common words of your app dozens of times. It can sometimes make sense to create some generic translation file that can be used in multiple components.

Has an example we will use a `buttons.php` translation file that can be used in multiple components.

#### Logical architecture

Creating one translation file by vue component if what made the most sense for me. I keep the same file architecture between the translation and vue components.

```
resources/
|-lang/
| |-en/
|   |-auth/
|   | |-login.php
|   | |-register.php
|   |-buttons.php
|-js/
  |-components/
    |-auth/
    | |-login.vue
    | |-register.vue
```

## Backend part, quick and easy

We only need one API endpoint to retrieve the translations. Let's call it `/translations`. To be efficient we want this endpoint to be able to return multiple translations files at the same time to avoid making too many AJAX calls. For this, we use a query parameter `keys` which will contain the translation files to retrieve separated by a comma. 

So if we call the route `/translations?keys=homepage,auth/login` the endpoint will return the value of the `homepage.php` and `auth/login.php` files.

```php
<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;

class TranslationController
{
    /**
     * /translations?keys=xxx.
     */
    public function index(Request $request)
    {
        // Return a 422 HTTP error code if no keys are provided
        abort_unless($request->has('keys'), 422);

        $keys = explode(',', urldecode($request->get('keys')));

        $trans = [];

        foreach ($keys as $key) {
            // The trans method is provided by Laravel and can return a whole translation file 
            $trans[$key] = trans($key);
        }

        return response()->json($trans);
    }
}
```

and that's all!

## Vuex part

I made this code while working with Vuex, Lodash, and Axios but they're not strictly necessary.

We need two state properties a vuex action called `trans` that only take a `keys` array parameter and two simple mutations.

### State

Here we define two properties:

* `translations` is the object that will contain the translations loaded from the API endpoint. The key used for the object will be the same that we pass as a parameter to our API.  
* `translation_request` is the object where we will store all ongoing request to handle concurrency.

```javascript
// Vuex state
const state = {
  translations: {},
  translation_request: {}
}
```

### Action

This is where the magic happens, but we need to do a little more than a simple GET request.

Imagine you have a Tweet component that needs to load a translation file, and you use this component a hundred times on the same page, you certainly do not want to execute hundreds of API calls. 

This is why we need to implement a simple concurrency test in order to avoid executing a call that is already executed or currently retrieving translations.

For each translation file key provided to this vuex action 3 states are possibles:

- The translation file has not been retrieved yet
- The translation file is currently being retrieved (the request has not yet received the API response)
- The translation file is already retrieved

```javascript
export const trans = ({ commit, state }, keys) => {
  // Cast keys as array
  keys = _.isArray(keys) ? keys : [keys]

  // If no keys are provided, we do not execute any API call
  if (keys.length === 0) return new Promise()

  // Get the list of keys for which we already retrieved the translations
  const retrievedKeys = _.filter(keys, (key) => {
    return state.translations.hasOwnProperty(key) && !_.isNull(state.translations[key])
  })

  // If all keys are already retrieved, we have nothing to execute and return an empty Promise
  if (retrievedKeys.length === keys.length) {
    return new Promise()
  }

  // Get the list of keys for which we are currently retrieving the translations
  const executingKeys = _.filter(keys, (key) => {
    return state.translation_request.hasOwnProperty(key)
  })

  // Get the list of keys that we did not yet retrieved
  const newKeys = _.filter(keys, (key) => {
    return !state.translations.hasOwnProperty(key)
  })

  // We create an array that store all Promise that are currently retrieving translations 
  let promises = _.map(executingKeys, (key) => {
    promises.push(state.translation_request[key])
  })
  
  // If we only have waiting keys, we return the promises that are executing
  if (newKeys.length === 0) {
    return Promise.all(promises)
  }

  // Trigger an API call on new keys, then we store the retrieved translations
  const request = axios.get(`/translations?keys=${encodeURIComponent(newKeys.join(','))}`).then((response) => {
    _.each(response.data.data, (value, key) => {
      commit(types.SET_TRANSLATION, { key: key, translation: value })
    })
  })

  // For each of the new keys we initialise the vuex property that will contain their corresponding translation and their currently executing request
  _.each(newKeys, (key) => {
    commit(types.SET_TRANSLATION, { key: key, translation: null })
    commit(types.SET_REQUEST, { key: key, promise: request })
  })

  promises.push(request)

  // Wait for all executing and new promises
  return Promise.all(promises)
}
```

### Mutations

Nothing too fancy here, the translation mutation just set the state for the `translation`. The request mutation set the state and add a final callback that removes it once the request is fully executed.

```javascript
// Vuex mutations
export default {
  [types.SET_TRANSLATION] (state, { key, translation }) {
    state.translations[key] = translation
  },

  // Request
  [types.SET_REQUEST] (state, { key, promise }) {
    state.translation_requests[key] = promise.finally(() => {
      delete state.translation_requests[key]
    })
  }
}
```

### Usage

Hopefully, you will never have to modify this code once you get it running and can now focus back on your application and translating it to as many languages as needed.

Here is a simplified login component example to show how to use this vuex translation approach, you can, of course, create a mixin or a custom getter to facilitate the retrieval of your translations.
 
```html
<template>
  <div v-if="!loading">
    {{ trans.login.title }}
    
    <form>
      <label for="email">{{ trans.login.email }}</label>
      <input type="text" name="email" id="email">
      
      <button>{{ trans.buttons.submit }}</button>
    </form>
  </div>
</template>

<script>
 export default {
   data () {
     return {
       loading: true
     }
   },

   mounted () {
     // We ask vuex for our translations and set the component as loaded once it's done
     Promise.all([
       this.$store.dispatch('trans', ['auth/login', 'actions']),
     ]).then(() => {
       this.loading = false
     })
   },

   computed: {
     // We return all the translations in a `trans` computed property
     trans () {
       return {
         login: this.$store.state.translations['auth/login'],
         buttons: this.$store.state.translations['buttons']
       }
     }
   }
 }
</script>
```

And that's it, you won't have to think about concurrency and duplicated AJAX requests while loading translations in your components!

## Caching

You can quickly add caching to your translation system by using [vuex-persistedstate](vuex-persistedstate). But you want the cache to be invalidated when one of your translation files changed.

What I do is using the current git hash and set it in a `MyApp.hash` variable that I can access from my javascript file to check if it has changed and invalidate the cache. I also set the current app environment in `MyApp.env` to always invalidate the cache while working locally.

You can find the current hash in PHP with the following line and store it in your HTML layout, you might want to store this value in a cached laravel config file to only execute it after a deploy:

```html
<html>
  <head>
    <!-- Your layout head -->
    <script>
      window.MyApp = {
        env: "{{ config('app.env') }}",
        hash: "{{ trim(exec('git log --pretty="%H" -n1 HEAD')) }}"
    </script>
  </head>
  <!-- Your layout body -->
</html>  
```

We also need to add a `hash` state property to know when we need to invalidate the cache.

```javascript
import PersistedState from 'vuex-persistedstate'

const state = {
  translations: {},
  translation_request: {},
  hash: MyApp.hash,
}

export default new Vuex.Store({
  // Load your state / action / getters..
  plugins: [
    PersistedState({
      key: 'myApp',
      storage: window.localStorage,
      
      // Invalidate the cache when we release a new version of the app
      getState: (index, storage) => {
        const savedState = index in storage ? JSON.parse(storage[index]) : null

        // If no cache exists, we don't do anything
        if (!savedState) {
          return
        }

        // If we have a new release, we reset the translation cache
        if (savedState.hash !== state.hash || MyApp.env === 'local') {
          delete savedState.translations
          savedState.hash = state.hash
        }

        return savedState
      },
      
      // Cache the hash and translations values in the browser localStorage
      paths: [
        'hash',
        'translations'
      ]
    })
  ],
})
```

Hope this is helpful, do not hesitate to suggest modifications to improve the code!
