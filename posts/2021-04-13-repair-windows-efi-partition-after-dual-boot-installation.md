---
type: post
title: Repair Windows EFI partition after a Linux installation
image: '/images/repair-windows-efi-partition-after-dual-boot-installation/repair-windows-efi-partition-after-dual-boot-installation.png'
tags: [windows, efi, linux, dual boot]
excerpt: A guide to repair Windows EFI partition after it get wrongfully erased by a Linux dual boot installation.
description: A guide to repair Windows EFI partition after it get wrongfully erased by a Linux dual boot installation.
date: 2021-04-13
---

I was exited to try the new Gnome 40 update on the latest Fedora beta release, 
and broke my Windows dual boot. I'm not sure how it happened but the `/boot/efi`
partition did not contain any Windows files after installing Fedora, preventing
`os-prober` to detect Windows and adding it to Grub2, I was also unable to boot 
Windows from the UEFI boot selector.

Fixing this took me way more time in internet digging than it should, so this 
blog article will serve my future self and other careless Linux dual boot 
enthusiast in case of missing Windows EFI files.

The first thing to do is to [download Windows latest ISO file](https://www.microsoft.com/en-us/software-download/windows10ISO)
and create a bootable USB key. For this I used [Balena Etcher](https://www.balena.io/etcher/)
which is the most shiny bootable USB maker tool that I could find.

After booting my laptop on the USB key with Windows, I tried an automatic repair 
which wiped my Fedora boot files in the `/boot/efi` partition, I had to reinstall
Fedora, which in turn removed all Windows files again and leaving me back to my
starting point, but 3 hours later.

Automatic repair was not what I needed, I had to dig deeper to fix that one. 
That's when I found the great [BCDBoot](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/bcdboot-command-line-options-techref-di) 
command that helped me fix my EFI partition.

Boot your computer on the USB key and navigate to the command prompt, it should 
be something like: 
`Repair Computer > Troubleshoot > Advanced > Command Prompt`

Once you are in the command prompt use the following command to show your 
partitions:

```
$ diskpart // Start a diskpart shell
diskpart> list disk  // List all disks
diskpart> sel disk <disk_id> // Select the disk with the EFI partition
diskpart> list vol // List all volumes
diskpart> sel vol <volume_id> // Select the EFI volume
diskpart> assign letter=F // Assign a letter to the EFI volume (I choosed F)
diskpart> exit
$ bcdboot C:\Windows /s F: /f ALL // Create all Windows boot files in F:
```

Note that the ALL flag will create files for UEFI and Bios based boot system. 
You can find all the available option for the `bcdboot` command in the
[documentation](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/bcdboot-command-line-options-techref-di).

I do not have much experience with the Windows shell so let me know if I missed
something. In any case I learned something new during the weekend, and I'm glad
I fixed my dual boot, I can now go back to playing Planet Zoo on Windows!
