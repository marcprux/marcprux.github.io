---
author: Marc Prud'hommeaux
pubDatetime: 2015-03-06T21:29:45Z
timezone: UTC
title: Inversion of Execution in Swift
featured: false
draft: false
tags:
  - swift
  - concurrency
description: "A Swift 1.2 experiment in letting the caller choose whether the same function runs synchronously or asynchronously."
---

_Originally published as a [GitHub gist](https://gist.github.com/marcprux/d7509048a458c445d807) on March 6, 2015. This is a historical Swift 1.2 example; the original APIs and syntax are preserved._

Demonstration of an _Inversion of Execution_ (**IoE**) technique for how the same function
can be executed either synchronously with a return value or asynchronously with a
callback block depending on an optional trailing `iex` (inverted executor) closure.

- When executed without a trailing closure, the result is provided as a return value:

  ```swift
  let result: Int = sum([1, 2])
  ```

- When executed with a trailing closure, the work operation will be synchronously passed as a function:

  ```swift
  let noresult: Void = sum([3, 4, 5, 6]) { f in
      let result: Int = f()
      ...
  }
  ```

- To execute asynchronously on the main thread, place the callback in the trailing closure:

  ```swift
  sum(Array(1...1_000)) { f in
      NSOperationQueue.mainQueue().addOperationWithBlock {
          let result: Int = f()
          ...
      }
  }
  ```

- To execute asynchronously on a background queue:

  ```swift
  sum(Array(1...1_000_000)) { f in
      dispatch_async(dispatch_get_global_queue(QOS_CLASS_BACKGROUND, 0)) {
          let result: Int = f()
          ...
      }
  }
  ```

The work being performed doesn't need to be aware of the execution context (modulo synchronization concerns).

## The executor closure

```swift
func sum<X>(
    numbers: [Int],
    iex: ((() -> Int) -> X)! = { f in f() as! X }
) -> X {
    // Note: compiler crashes if iex is not marked as an optional or implicitly unwrapped optional

    return iex {
        // The hard stuff: actually perform the calculation
        return reduce(numbers, 0, +)
    }
}
```

## An async-capable reduce

```swift
func reductor<S: SequenceType, U, X>(
    sequence: S,
    initial: U,
    combine: (U, S.Generator.Element) -> U,
    iex: ((() -> U) -> X)! = { f in f() as! X }
) -> X {
    return iex { reduce(sequence, initial, combine) }
}
```

## A recursive example

```swift
func naïvefib<X>(n: Int, iex: ((() -> Int) -> X)! = { $0() as! X }) -> X {
    return iex {
        // here we take advantage of the trailing closure having a default synchronous executor:
        // we recursively execute ourselves synchronously by omitting the parameter
        return n < 2 ? n : (naïvefib(n - 1) + naïvefib(n - 2))
    }
}
```

## Demonstrating the behavior

```swift
import XCTest

class InversionOfExecutionDemo: XCTestCase {

    func testExample() {

        // Running with direct callback provides the work result as a return value
        let result1 = sum([5, 1], iex: { $0() })
        XCTAssertEqual(6, result1)

        // You can also exclude the final parameter and it will automatically execute as a return value
        // But note that the type cannot be inferred, so it needs to be declared with the property
        let result2: Int = sum([5, 9])
        XCTAssertEqual(14, result2)

        // Running with an immediate callback provides the work result synchronously as the callback argument
        let noreturn: Void = sum([3, 6]) { f in
            let result3 = f()
            println("immediate: \(result3)")
            XCTAssertEqual(9, result3)
        }

        // Running with a execution callback will enqueue the work and asynchronously provide it to the callback
        weak var xp = expectationWithDescription("eventual callback")

        sum(Array(1...1000)) { f in
            dispatch_async(dispatch_get_global_queue(QOS_CLASS_BACKGROUND, 0)) {
                let result4 = f()
                println("eventual: \(result4)")
                XCTAssertEqual(500_500, result4)
                xp?.fulfill()
            }
        }

        // Await the the eventual callback result
        waitForExpectationsWithTimeout(1) { err in XCTAssertNil(err) }

        let concat: String = reductor(["a", "b", "c"], "", +)
        XCTAssertEqual("abc", concat)

        // A small fib calculation should be executed synchronously
        let fib5: Int = naïvefib(5)

        weak var xp2 = expectationWithDescription("eventual callback")

        // a large fib calculation should be run in the background
        naïvefib(30) { f in
            dispatch_async(dispatch_get_global_queue(QOS_CLASS_BACKGROUND, 0)) {
                let fib30 = f()
                println("fib30: \(fib30)")
                XCTAssertEqual(832_040, fib30)
                xp2?.fulfill()
            }
        }

        waitForExpectationsWithTimeout(10) { err in XCTAssertNil(err) }
    }
}
```
