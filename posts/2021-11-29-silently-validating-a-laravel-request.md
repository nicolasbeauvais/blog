---
type: post
title: Silently validating a Laravel request
image: '/images/silently-validating-a-laravel-request/silently-validating-a
-laravel-request.jpg'
tags: [laravel, validation, exception]
excerpt: In some cases, the Laravel validator gives out too many details. What if we want to use the power of the validator without giving anything in the response? 
date: 2021-11-29
---

While working on the Content Security Policy implementation of [Phare]
(https://phare.app), I had to implement a public endpoint to receive violation 
report from web browsers. The issue being that this endpoint URL can 
receive data from anyone that throw a request to it, and in slightly different 
format depending on the browser.

As the input cannot be trusted, using some form of validation is mandatory, 
Laravel validator is perfect for this, and as it can be quite a complicated 
validation, using a [Form Request](https://laravel.com/docs/master/validation#form-request-validation) 
seemed to be the most appropriate. 

This is where things can get annoying, if a browser with an old content 
security policy sends a payload that I do not which to support in my API, the 
Form Request will send a response with a 422 status code, which will create a 
console error in the browser. And if a malicious script kiddy troll want to 
send a payload to the endpoint, I do not want to the API response to contains 
exactly how to correct a wrong payload.

After some digging I found out that the `FormRequest` class has a 
`failedValidation` method that throw a `ValidationException`, caught by the 
Laravel exception handler to create the default 422 response with the error bag.

```php
// source: vendor/laravel/framework/src/Illuminate/Foundation/Http/FormRequest.php

class FormRequest extends Request implements ValidatesWhenResolved
{
    ...
    
    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function failedValidation(Validator $validator)
    {
        throw (new ValidationException($validator))
                    ->errorBag($this->errorBag)
                    ->redirectTo($this->getRedirectUrl());
    }
    
    ...
}
```

By overriding this method in our own `FormRequest`, we can throw a custom 
`ValidationException` that fail silently, by returning a 2XX status code and not
showing any error message.

Let's start by creating our custom exception, I named it 
`SilentValidationException`, it take two parameters, first an instance of 
the Laravel validator which will contain the errors of the `FormRequest` 
validation, and a custom exception message. I chose to store the error payload
as an array to reuse it later.

```php
<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Contracts\Validation\Validator;

class SilentValidationException extends Exception
{
    private array $errors;

    public function __construct(string $message, Validator $validator)
    {
        parent::__construct($message);

        $this->errors = $validator->errors()->toArray();
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
```

We can then make our `FormRequest` that will throw the 
`SilentValidationException` if the payload validation fail.

```php
<?php

namespace App\Http\Requests;

use App\Exceptions\SilentValidationException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class ContentSecurityPolicyViolationRequest extends FormRequest
{
    public function authorize(): bool
    {      
        return true;
    }

    public function rules(): array
    {
        return [
            'csp_report' => [
                'required',
                'array'
            ],
            // Many validation rules
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new SilentValidationException(
            $validator, 
            'Content security policy violation ignored'
        );
    }
}
```

Now, if you try that code, Laravel will handle our 
`SilentValidationException` as any other exception and show an error page. 
To avoid this, we need to change the exception handling behavior for this 
particular exception. This can be done in the `app/Exceptions/Handler.php` file.

There is two things to do in that file, we first want to register our custom 
exception in the `$dontReport` array to avoid logging the error in your log 
file, Sentry, Flare or whatever error service that you use. 

```php
<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Log;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var string[]
     */
    protected $dontReport = [
        SilentValidationException::class,
    ];
}
```

Now this does not change the response, to do this we need to register a callback
in the `register` method of the `Handler` class, as explained 
[in the documentation](https://laravel.com/docs/master/errors#rendering-exceptions).

Here we can get creative and do whatever we want with the error payload before 
sending the response. I could for instance store the errors in a database 
table to see which error occurs the most to make my API compatible with 
more browsers.

To keep this example simple, let's just log the validation errors and return a
`no content` response:

```php
<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Log;

class Handler extends ExceptionHandler
{
    ...

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->renderable(function (SilentValidationException $exception) {
            Log::info($exception->getMessage(), $exception->getErrors());

            return response()->noContent();
        });
    }
}
```

That's it! you now know how to silently validate a payload using a Laravel 
Form Request.

