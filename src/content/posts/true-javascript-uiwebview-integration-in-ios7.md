---
author: Marc Prud'hommeaux
pubDatetime: 2013-10-15T12:00:00Z
title: True JavaScript+UIWebView integration in iOS7
slug: true-javascript-uiwebview-integration-in-ios7
featured: false
draft: false
tags:
  - javascript
  - uiwebview
  - ios7
description: "iOS7 quietly added a modern Objective-C wrapper around JavaScriptCore, but forgot to document how to get a JSContext from a UIWebView. Here's the missing trick."
---

For a long time on the Mac (ever since Mac OS 10.3), we've had good, albeit weird, Objective-C and JavaScript interoperability with the `WebScriptObject`. With your WebKit `WebView`, you could do fun things like:

```objc
WebView *webView = [[WebView alloc] init];
WebScriptObject *script = [webView windowScriptObject];
id three = [script evaluateWebScript:@"1+2"];
NSAssert([three isEqual:@(3)], @"as expected");
```

You could even call Objective-C from JavaScript with bridged objects:

```objc
WebView *webView = [[WebView alloc] init];
WebScriptObject *script = [webView windowScriptObject];
script[@"myObject"] = [[SomeObject alloc] init];
id selectorResult = [script evaluateWebScript:@"myObject.invokeASelectorAsIfItWereAFunction()"];
```

I refer to the API as _weird_ because you would need to do strange stuff like implement the `NSObject` informal protocol method:

```objc
+ (BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector
```

in your target class in order for JavaScript to be able to invoke arbitrary methods on your classes. And there's no real error handling. But overall it works well: Objective-C can call arbitrary JavaScript and JavaScript could call Objective-C. It has been used in countless Mac apps over the years.

Mac OS 10.5 greatly enhanced the JavaScript interoperability by exposing a C API to the underlying JavaScript engine used by WebKit: JavaScriptCore. With the C API you could directly set and get properties on JavaScript objects, and even create a standalone WebKit-free `JSContextRef` instance to run your JavaScript:

```objc
JSGlobalContextRef ctx = JSGlobalContextCreate(NULL);
JSValueRef *exception = NULL;
JSValueRef result = JSEvaluateScript(ctx, JSStringCreateWithCFString((__bridge CFStringRef)@"1+2"), NULL, NULL, 0, exception);
double num = JSValueToNumber(ctx, result, exception);
NSAssert(num == 3.0, @"works, but C is soooooo tedious");
JSGlobalContextRelease(ctx);
```

The `WebScriptObject` class added a reference to the underlying `JSObjectRef` instance so that you could directly interface with the JavaScript runtime that was attached to a `WebView`. The C API was tedious, but Objective-C wrapper libraries such as Patrick Geiller's delightful _JSCocoa_ project ([https://github.com/parmanoir/jscocoa/](https://github.com/parmanoir/jscocoa/)) arose to reduce the pain. It was adopted by many Mac apps and frameworks (such as _Acorn_ and _Coda_) as a bridge that allowed plugins to be written in JavaScript.

On iOS' `UIWebView`, in contrast, JavaScript interoperability has always been limited to exactly one method: the notorious:

```objc
- (NSString *)stringByEvaluatingJavaScriptFromString:(NSString *)script
```

This method would let you do things like:

```objc
UIWebView *webView = [[UIWebView alloc] init];
NSString *result = [webView stringByEvaluatingJavaScriptFromString:@"1+2"];
NSAssert([result isEqualToString:@"3"], @"correct, but strings are kind of unsatisfying");
```

Strings in, strings out. Back when I was writing the Stanza e-book reader app, this was how I performed the vast majority of interaction between the UI and the underlying web renderer. But there is no interoperability between the Objective-C world and the JavaScript world, so you need to cobble together some kind of bridge on your own, which many people did. As far as I can tell, almost everyone that made a two-way bridge between JavaScript and Objective-C used a hacky trick with setting the document's URL to some encoded data, and then intercepting that data in the `UIWebView`'s delegate:

```objc
- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
```

The delegate would then decode the data encoded in the URL and do some stuff in the Objective-C world, and then call back into an asynchronous handler using the `stringByEvaluatingJavaScriptFromString` method again. This seems to be the path that all the JavaScript-to-native bridge technologies like PhoneGap/Apache Cordova take. It works, but it is painful because everything is asynchronous, there's no error handling, and object marshaling is all manual and error-prone.

And that was the state of the art until a few months ago, when Apple quietly ([http://www.steamclock.com/blog/2013/05/apple-objective-c-javascript-bridge/](http://www.steamclock.com/blog/2013/05/apple-objective-c-javascript-bridge/)) slipped a new Objective-C JavaScriptCore wrapper into the WebKit source code. It basically looks like a modernized form of the venerable Mac `WebScriptObject` classes, heavily influenced by JSCocoa.

```objc
WebView *webView = [[WebView alloc] init];
JSContext *ctx = [JSContext contextWithJSGlobalContextRef:webView.mainFrame.globalContext];
JSValue *three = [ctx evaluateScript:@"1+2"];
NSAssert([[three toNumber] isEqual:@(3)], @"It Is As It Was");
```

You can also do awesome things by setting a block as a property in the context (or any JavaScript object) and it will automatically be exposed to the JavaScript runtime as a function. Behold:

```objc
[ctx evaluateScript:@"console.log('this is a log message that goes nowhere :(')"];
ctx[@"console"][@"log"] = ^(JSValue *msg) {
    NSLog(@"JavaScript %@ log message: %@", [JSContext currentContext], msg);
};
[ctx evaluateScript:@"console.log('this is a log message that goes to my Xcode debug console!!!! :)')"];
```

The possibilities are endless. And at the "Integrating JavaScript into Native Apps" session at WWDC this year ([http://asciiwwdc.com/2013/sessions/615](http://asciiwwdc.com/2013/sessions/615)), I was excited to hear them mention that this new API is also available in iOS7! iOS has never even exposed the C-level JavaScriptCore APIs, so this should be quite a breakthrough in hybrid apps that want to interoperate between JavaScript and Objective-C.

And while the API is indeed publicly available in iOS7 now, there are a few problems that indicate that this feature isn't quite completely baked. First off, it is _completely undocumented_. Search the Xcode API docs for `contextWithJSGlobalContextRef`, and all you will find is the API diffs. Heck, search the internet (as of this writing) for `contextWithJSGlobalContextRef`, and all you will find is links to API diffs, some WebKit source code change logs, and a couple of sites in Chinese. Literally _no one_ is using this yet. I guess they just forgot the docs. Your best bet is to probably read the header files (e.g., `/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS7.0.sdk/System/Library/Frameworks/JavaScriptCore.framework/Headers/JSContext.h`) and browse the source code (e.g., [JSContext.mm in WebKit](https://github.com/mirrors/WebKit/blob/master/Source/JavaScriptCore/API/JSContext.mm)).

The other, more serious, problem is that they appear to have forgotten to document how to get a `JSContext` from a `UIWebView`, which is critical because without it, all you have is a stand-alone `JSContext` object. And while this could be useful for loading small stand-alone JavaScript libraries that don't rely on a browser, it doesn't let you drive any of your browser UI with Objective-C and basically makes it an isolated script interpreter. A number of people have complained about this limitation on [https://devforums.apple.com](https://devforums.apple.com), but thus far no one seems to have come up with any solution. After a little poking around, however, I found that you can get a hold of a `UIWebView`'s `JSContext` object using a KVO-compliant path, like so:

```objc
JSContext *ctx = [webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
```

And it is thereby now possible to combine the new power of the JavaScriptCore bindings with the flexibility of UIWebView content. For example, here's a `UIViewController` that adds a `UIWebView` and animates the background colors via Objective-C:

```objc
//
//  ViewController.m
//  UIWVScript
//
//  Created by Marc Prud'hommeaux on 10/15/13.
//  Copyright © 2013 impathic. All rights reserved.
//

#import "ViewController.h"
@import JavaScriptCore;
@import ObjectiveC;

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    // set up a full-screen UIWebView
    UIView *view = self.view;
    UIWebView *webView = [[UIWebView alloc] init];
    [view addSubview:webView];
    webView.translatesAutoresizingMaskIntoConstraints = view.translatesAutoresizingMaskIntoConstraints = NO;
    for (NSString *fitFormat in @[@"H:|-0-[webView]-0-|", @"V:|-0-[webView]-0-|"])
        [view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:fitFormat
                                                                   options:0
                                                                   metrics:nil
                                                                     views:NSDictionaryOfVariableBindings(webView)]];

    JSContext *ctx = [webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
    NSAssert([ctx isKindOfClass:[JSContext class]], @"could not find context in web view");

    [ctx evaluateScript:@"console.log('this is a log message that goes nowhere :(')"];
    ctx[@"console"][@"log"] = ^(JSValue *msg) {
        NSLog(@"JavaScript %@ log message: %@", [JSContext currentContext], msg);
    };
    [ctx evaluateScript:@"console.log('this is a log message that goes to my Xcode debug console :)')"];

    JSValue *style = ctx[@"document"][@"body"][@"style"]; // yes, this works: KVC FTW!
    NSAssert(style, @"there should be a style element in the document body");

    // set up the body's style so all CSS changes are animated
    NSTimeInterval colorChangeInterval = 1.0;
    style[@"transition-timing-function"] = @"linear";
    style[@"transition-delay"] = @(0);
    style[@"transition-duration"] = [NSString stringWithFormat:@"%@s", @(colorChangeInterval)];

    // this sets up a JavaScript-function-to-Cocoa-block bridge
    ctx[@"setRandomColor"] = ^() {
        style[@"background"] = [NSString stringWithFormat:@"hsl(%@, %@, %@)", @(arc4random() % 255), @"50%", @"50%"];
        NSLog(@"fading to color: %@", style[@"background"]); // notably, this will not output hsl format, but instead rgb format like: "rgb(63, 191, 179)"
    };
    JSValue *setColorFunction = ctx[@"setRandomColor"];
    NSAssert([setColorFunction isObject], @"it was a block, but now it should be a bridged JSValue function object");

    // we can call our background-setting code directly via JavaScript
    [setColorFunction callWithArguments:nil];

    JSValue *setIntervalFunction = ctx[@"setInterval"]; // grab the built-in setInterval repeating timer function
    NSAssert([setIntervalFunction isObject], @"setInterval should have been a function object");

    // now set up a repeating timer in JavaScript that calls our background-changing Cocoa function
    [setIntervalFunction callWithArguments:@[setColorFunction, @(colorChangeInterval * 1000.)]];
}

@end
```
