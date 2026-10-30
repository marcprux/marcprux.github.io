---
author: Marc Prud'hommeaux
pubDatetime: 2026-10-29T12:00:00Z
title: On Leaving Swift for Rust
slug: goodbye-swift-hello-rust
featured: false
draft: false
tags:
  - swift
  - rust
description: "A fond farewell to Swift"
---

Yesterday I [resigned](https://github.com/swiftlang/swift-org-website/pull/1589) from the [Swift Android workgroup](https://www.swift.org/android-workgroup/). I've received a number of inquiries about this, and rather than responding individually to each one, I figured I would just write up a post with my reasoning and submit it to the public record.

First off, my resignation was not triggered by any sort of conflict, grievance, or specific incident. Early Swift community efforts got off to a rough start when Swift language creator Chris Lattner quit  due to what he [described](https://mjtsai.com/blog/2022/02/22/why-latter-left-the-swift-core-team/) as a "toxic environment". This event predates my direct involvement in the project, so I am not privy to the specifics. But I want to be clear that this was in no way my experience: everyone I interacted with, both from Apple and external organizations, both in meetings and in forum discussions and direct messages, have been polite, courteous, and the paragon of civility and professional conduct. Despite Apple having an ancient [blood feud](https://appleinsider.com/articles/11/10/21/steve_jobs_vowed_to_destroy_google_android_called_it_a_stolen_product) with Android, and my own [rather](https://appfair.org/blog/a-future-for-app-stores/) [acrimonious](https://appfair.org/blog/digital-markets-act-workshop/) [relationship](https://appfair.org/blog/fear-and-loathing-in-the-app-stores/) with certain divisions of the company, every single one of my direct interactions with the Swift team has been pleasant and productive. I will miss our meeting and chats, and I harbor zero ill-will towards the project or any of the individual members I've worked with.

So why quit?

## Computer Languages, Past and Future

By way of background, I've been programming for over 40 years. I started with Basic, then Pascal, on to C, then C++, over to Java, up to Scala, back down to Kotlin, around to Objective-C, before finally landing on Swift. Swift is a delightful language: I loved it from day one and I've been [boosting](/talks/#2014) it around the world since 2014. Swift really "does what it says on the tin": it couples the performance of C++ with the ease of Java. And Swift is as developer-friendly as it gets:  an intuitive object-oriented syntax coupled with maximally efficient value types, fabulous tooling (on Apple platforms), and a thoughtfully-designed build system.

I have _not_ soured on Swift: I think it is an excellent language, and it is here to stay. But it is here to stay in that same straight-and-narrow lane shared by all corporate-directed languages, like C# is here to stay for Microsofties and like Kotlin is here to stay for Androidophiles. Which isn't bad in and of itself: if you want to write software solely for `[CORPORATE PRODUCT]`, then `[CORPORATE LANGUAGE]` will always be well-maintained, supported, and they will _always_ provide support for their latest products, with an easy migration path forward. They are the safe and happy path, as long as you stay in your lane and limit your ambitions to writing software for `[CORPORATE PRODUCT]`.

But when you stray from that happy path, the rough edges start surfacing, and there is no one getting a paycheck to smooth those out. Swift for Android/Windows/other-non-Apple-platform is in exactly that position: yes, it _technically_ works, and yes, the language steering committees are committed to continuing the level of support they promised, but it will never be the same seamless experience as developing for iOS/watchOS/visionOS/whateverOS. This extends beyond the language and into the tooling: [Skip](https://skip.dev) enables you use Xcode to develop your apps in parallel for iOS and Android, but this has only been achieved in the face of Xcode's constitutional hostility towards doing anything other than optimizing for their own first-party platforms.

## The Rise of the Clankers

If humanity were destined to continue creating software solely with their monkey brains and meat fingers, Swift would likely be the language I would have stuck with until the day I retired. But that isn't the trajectory we are currently on. Barring such speculative calamities as "model collapse", Butlerian Jihad, or Skynet, we have taken a turn in a new direction.

We software developers have collectively [as/de]cended to a plane where we now direct the computers to write our computer code, and these computers have decided that they really prefer _computery_ languages over the _humany_ languages. _Humany_ languages are those designed to fit inside our wonderful little biological brains. I have grave reservations about all of this from many perspectives: ethical, ecological, political, socio-economical (just to name a few). But it is what it is, and all but the most ardent of refusenik software developers have come around to this view in the past 6—12 months.

Swift isn't a _computery_ language, it is a developer-friendly _humany_ language: it is a better Java, a better C#, and a (much) better Objective-C. Throughout my career I've been able to accomplish amazing feats in these languages, disproportionate to my limited intellect and abilities, but that comes at the cost of these languages being hobbled in pursuit of their mission to slice and dice complex problems in such a way as to be tractable for one or more human brains. I speak of object-orientation; I speak of automatic memory management.

But there is one **very** _computery_ language that until recently has been waiting in the wings…

## All roads lead to Rust

In February, Andreas Kling dropped [Swift for Rust](https://ladybird.org/posts/adopting-rust/) for the Ladybird browser, a 180°[^1] turnabout from their opposite decision from a [year earlier](https://www.youtube.com/watch?v=DSEZ2ZYLdHg). In July, Jarred Sumner ported Bun from [Zig to Rust](https://bun.com/blog/bun-in-rust). In September, David Heinemeier Hansson filicided [Ruby on Rails for Rust](https://www.globalnerdy.com/2026/09/27/dhhs-keynote-at-rails-world-2026-the-most-confusing-funeral-ive-ever-experienced/). And this trend is only accelerating: nearly every week there is some new project converting some massively complex codebase from language X to Rust. [PostgreSQL](https://news.ycombinator.com/item?id=48841676)! The [TypeScript compiler](https://www.theregister.com/devops/2026/10/15/24000-ai-experiment-ports-typescript-compiler-to-rust/5303409)! These projects are coming fast and furious with no sign of slowing down. And for every one of these projects, over 95% of the code was not written by a human.

[^1]: The initial revision of this post said "360°" when it meant "180°". Thank you, internet commentariat, for your gracious corrections.

Swift is wonderful. It enabled me to bring iOS development to Android through Skip and share a single codebase between the two dominant mobile platforms. LLMs are quite proficient with Skip: Claude or Codex can one-shot a passable prototype for a new iOS+Android app written in Swift in a matter of minutes and you can have it running side-by-side on emulators or devices and start iterating to your heart's content. The single shared codebase gives the LLMs the ability to develop and refine features in single codebase, rather than constantly needing one codebase (e.g., in Kotlin and Compose) play catch-up with the other (Swift and SwiftUI) codebase.

But I always wanted more from Skip. I wanted to add support for desktop platforms for Mac, Linux, and Windows. I wanted the same codebase to run on the web through webassembly. I wanted to build for emerging mobile platforms like HarmonyOS and anything that might come next. And I wanted to do it all using each platform's native first-party toolkits rather than the usual web-shell compromise or pixel-painting mimicry, because, like Apple, I believe that [the best apps are built with native SDKs](https://developer.apple.com/videos/play/wwdc2024/102/?time=3849).

In addition to supporting a wider range of _target_ platforms, I also wanted to bring this power to more development _host_ platforms. You can currently only use Skip to develop apps from a macOS host; Windows and Linux users are left out in the cold. And while there is some [impressive work](https://xtool.sh) happening to bring iOS development to non-macOS hosts, those tools will take a while to percolate, and appear to [face the wrath](https://github.com/xtool-org/xtool/issues/55#issuecomment-2898015355) of the platform overlords. For Skip, it is irksome enough that even the Android target of the app cannot be developed on a non-macOS host, but when it comes to expanding the platform targets, it becomes downright absurd if, say, you would be unable use Skip to develop a HarmonyOS app from a Windows host.

Swift — both the language as well as the tooling — is simply not equipped to handle those needs yet, and despite its impressive progress with their cross-compilation SDKs, I don't think it ever will be. It will _always_ be an Apple-platforms-first technology, and anything beyond that insular world will be consigned to an eternal Sisyphean uphill grind.

Rust, on the other hand, wasn't designed for a single platform, or even a small handful of platforms. They support [300 platforms](https://doc.rust-lang.org/nightly/rustc/platform-support.html). Cross-compilation has been a foundational principle from day one, rather than being a bolted-on afterthought. This leads to an ecosystem that values building for everything and everyone, with no platform bias. When I started out on this journey, I was frankly astonished when the code I was tinkering with for iOS — which included dozens of rando [crates.io](https://crates.io/) dependencies that I yolo'd into my little research project — _just worked_ for Android. And Windows. And Linux. And HarmonyOS. And Webassembly.

Then when I discovered that despite its massive power and potential, you still [can't craft a decent consumer-facing app](https://areweguiyet.com) in Rust, my mission was clear. Escaping the surly bonds of the platform has always been my personal obsession, and in the mere six months since I started down this road, I've created the ultimate all-singing-all-dancing omni-platform development tool. More on that in a future post. "Like and subscribe", as the kids say.

But getting back to the point: Swift will be fine. It is here to stay, at least for Apple platform development. And Skip will be fine: it has a growing community of developers and maintainers that will keep the project going strong and keep up with Swift and Xcode updates. Skip will continue to improve the Android side of the coin in step with Apple's improvement of the iOS side. I am confident that both technologies will keep chugging along indefinitely, powering fabulous apps on Apple and Android platforms alike, well into the future.

But that is not _my_ future. Software development is suddenly no longer hard. App development is suddenly no longer hard. And I need to be solving hard problems in order to thrive.
