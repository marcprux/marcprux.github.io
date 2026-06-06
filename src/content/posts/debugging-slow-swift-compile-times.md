---
author: Marc Prud'hommeaux
pubDatetime: 2014-10-10T12:00:00Z
title: Debugging slow Swift compile times
slug: debugging-slow-swift-compile-times
featured: false
draft: false
tags:
  - swift
  - xcode
  - performance
description: "Slow Swift compile times often come down to type inference. Here's how to find the offending lines and speed them up with a few well-placed casts."
---

A number of blog posts have been reporting slow compile times with Swift code. I recently ran into this in a test case where I was creating a fairly simple nested structure, which makes me assume that type inference was the culprit.

In Xcode 6.1, this tiny bit of code takes an astonishing _40 seconds_ to compile:

```swift
func hangCompiler() {
    ["A": [ ["B": [ 1, 2, 3, 4, 5 ]], ["C": [ ]], ["D": [ ["A": [ 1 ]] ]] ]]
}
```

So if you have code with a bunch of nested declarations, it appears the type inference solver can be the thing that takes up a ton of time. How to identify the slow parts of your compile time? I went to the "Report Navigator" tab of Xcode during the slow build, clicked on the currently running build, and clicked the horizontal bar button next to "Compile Perf.swift" to see the Xcode command that is being run. The line is super long, but looks something like this:

```bash
/Applications/Xcode.app/.../usr/bin/swift -frontend -c -primary-file .../Perf.swift ...x86_64/Perf.o
```

I then copied and pasted it into a new Terminal.app window, and while it was grinding away, I hit <kbd>CTRL</kbd>+<kbd>\\</kbd> (control + backslash), and it spit out some very useful info:

```text
1. While type-checking 'doPerf' at /tmp/SwiftPerformance/Perf.swift:12:5
2. While type-checking expression at [/tmp/SwiftPerformance/Perf.swift:12:5 - line:12:76] RangeText="["A": [ ["B": [ 1, 2, 3, 4, 5 ]], ["C": [ ]], ["D": [ ["A": [ 1 ]] ]] ]]"
```

Handy!

How to speed up the compile time? You can give some hints to the type inference engine by seeding in some ugly casts:

```swift
["A": [
    ["B": [ 1, 2, 3, 4, 5 ]] as [String: [Int]],
    ["C": [ ]] as [String: [Int]],
    ["D": [ ["A": [ 1 ]] as [String: [Int]] ]]
]]
```

Those little hints bring the compile time down to .18 seconds.

So if you are seeing very slow compile times with certain source files, you can isolate the offending lines by pasting in the compiler command and hitting <kbd>CTRL</kbd>+<kbd>\\</kbd>, and then if nested type inference is the culprit, you can speed it up by sprinkling in some casts here and there.
