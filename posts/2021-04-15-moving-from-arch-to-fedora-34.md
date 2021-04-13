---
type: post
title: Moving from Arch to Fedora 34
image: '/images/moving-from-arch-to-fedora-34/moving-from-arch-to-fedora-34.png'
tags: [linux, arch, fedora]
excerpt: I moved from Arch Linux after 4 months of pain, and made Fedora 34 my daily driver.
description: I moved from Arch Linux after 4 months of pain, and made Fedora 34 my daily driver.
date: 2021-04-15
---

After 4 years of using Debian with no troubles, I decided, back in last November
to try Arch as my daily driver on a new work laptop I just got. Installing Arch
was painful, making all my programs work under Wayland on a 4k screen took me a 
lot of time, and they were a lot of small annoying things that I did not have 
time to fix, making the whole experience irritating.

I started with a big TODO list of all the things I wanted to set up on the new
laptop, but used so much time fixing things, that I gave up on many of my 
todo list items, one being system backups. Fast-forward 4 months later and the 
obvious happened, my system broke after an upgrade.

My choice was simple, try and fix it, or start again. After 4 months of pain, I 
felt that it was probably a good sign for me to drop Arch, go back to 
something that just works, and spend my time doing more useful things. I've 
learned a lot of doing the entire Arch installation from scratch, setting up
ethernet and Wi-Fi, creating custom keyboard layouts, and many other things. 
I would probably recommend the process to anyone that want to improve its Linux 
skills, but I personally had enough.

Debian was the obvious choice to go back to, being my distribution of choice for
a long time and my number one choice for all my servers, but the release system 
is not on pace with today's web development. 

After some research I decided to try Fedora 34 with the new shiny Gnome 40, and 
I was not disappointed! Everything worked right after the installation, 4k 
resolution on all the programs, it's fast, looks nice, Wayland without glitches, 
and no need to do a Google search everytime I need to set up a new Wi-Fi 
connection. I was reluctant to go back to Gnome after 3 years of I3 and Sway, 
but some carefully chosen keymaps made the transition easy, and my workflow was 
not impacted at all.

I still had to learn how to use DNF, Fedora's package manager, SELinux that come
by default and will prevent you from doing shady stuff like running Docker, and
rebuild my dotfiles almost from scratch, but it's a small investment to have 
a featureful and stable desktop environment.

Overall I'm really happy with the switch, it feels like I'm using a desktop 
environment made in the future. My Fedora install is not as barebone 
and take a bit more resources, but it's well worth it, considering all the time 
that I do not need to spend fixing programs behavior on Sway.

If you're interested in trying Fedora 34, you can take a look at 
[my dotfiles](https://github.com/nicolasbeauvais/.dotfiles) which set up a 
working PHP / JS development environment and get rid of a lot of not so useful
things that come with Fedora.

Finally, if like me, you have a Windows dual boot and went a bit too fast during 
the installation of Fedora 34, [here is how to repair a broken Windows EFI partition](/2021-04-13-repair-windows-efi-partition-after-dual-boot-installation).
