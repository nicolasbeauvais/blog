---
type: post
title: 'Is it time to ditch MySQL and PostgreSQL for SQLite?'
image: '/images/is-it-time-to-ditch-mysql-and-postgresql-for-sqlite/is-it-time-to-ditch-mysql-and-postgresql-for-sqlite.jpg'
tags: ['SQLite', 'MySQL', 'PostgreSQL', 'Database']
excerpt: 'SQLite is getting all the hype lately, but can it really compete with MySQL and PostgreSQL for production web applications?'
date: 2023-01-25
---

Alright, I hear you, "SQLite is a toy database", "SQLite is too slow", "SQLite is not scalable", yada yada yada. 

Well, we're in 2024 now, and things have changed. SQLite is all the rage, with [Kent C. Dodds](https://www.epicweb.dev/why-you-should-probably-be-using-sqlite) and [DHH](https://twitter.com/dhh/status/1746248449555878243) pushing it, [native support added to Bun](https://twitter.com/jarredsumner/status/1746892626618671322), and if you've been following hacker news, you [probably](https://news.ycombinator.com/item?id=26816954) [noticed](https://news.ycombinator.com/item?id=34812527) an [increase](https://news.ycombinator.com/item?id=31318708) in SQLite praising posts in the past few years.

It's not news, SQLite has been around for more than 20 years, and is the most deployed database engine, but got ignored for web application in favor of client-server databases that perform better on write-intensive applications.

Should you follow the hype and start using SQLite in production? And if so, how to do it properly? Let's find out together.

---

## Why choose SQLite over MySQL or PostgreSQL?

DevOps fatigue is real, developers are expected to know more and more about infrastructure, CI / CD, Docker, networking, Kubernetes, clustering, sharding, and the list goes on. But the reality of the trade is that most projects don't need half of these things. There's a pushback against the complexity of modern web development, engraved with a comeback of the Monolith and a steady growth on simpler frontends frameworks like Alpine.js and htmx.

SQLite fits in this logic by providing a simpler alternative to the traditional client-server model of MySQL and PostgreSQL, not without its own set of tradeoffs that can make your project a disaster if not carefully considered.

So why would you choose SQLite over MySQL or PostgreSQL? Here are some of the main reasons:

### SQLite is simple

SQLite is already bundled with the default [PHP](https://www.php.net/manual/en/extensions.membership.php) and [Python](https://docs.python.org/3/library/sqlite3.html) installation, and if you use another backend language, chances are that there's good support for it.

By the nature of its design as an embedded C library, you do not need to manage a process, a server, or a socket. You can see it as a language extension that writes/read a `.sqlite` file when you ask it to and that's it.

Because it's already bundled with the languages that we love, it greatly simplifies the release process. No need to worry about installing and maintaining a database server on all developer's local environment, you get simpler CI/CD pipelines, if you have PHP/Python installed, you have a working database.

In comparison, MySQL and PostgreSQL will require you to install it, usually from a package manager, handle user access, add it as a dependency to your CI/CD pipelines, and finally do it all again in a new production server that you will need to manage and secure, you get the picture.

### SQLite is portable

It runs pretty much anywhere, and it's painless to move around as everything just sits in a single file.

One of your colleagues needs your local database to check something? Send them the file. Need to make a backup? Copy the file. Need to reset the database? Delete the file.

```bash
# Simple to move around
$ rsync database.sqlite server:/path/to/database.sqlite

# Simple to backup
$ cp database.sqlite database.backup.sqlite

# Simple to delete
$ rm database.sqlite
```

You can even commit it to your git repository, and have a single source of truth for your database schema and data, or even get a pre-seeded database that is ready to use for your future colleagues.

Move it from Windows to macOS, to a Linux CI/CD pipelines on Docker, to a Raspberry Pi, to a VPS, to a serverless function, it will work without any change.

> Fun fact: The creators of SQLite described it as a [serverless database](https://www.sqlite.org/serverless.html) in 2007 which was 7 years before the release of AWS Lambda.

### SQLite is fast

Yes, benchmarks should always be taken with a grain of salt, but the takeaway is that SQLite is fast enough for most small-to-medium web applications. In fact, in the right conditions it can even be [faster than MySQL or PostgreSQL](https://www.golang.dk/articles/benchmarking-sqlite-performance-in-go). 

I made a **simplistic** benchmark performed on a base Laravel application, with a default local MySQL database, and a slightly tuned SQLite database with the following tests:

- Single write: insert 5 000 rows one by one
- Bulk write: insert 200 times 5 000 rows at once
- Single read: read 5 000 rows one by one
- Bulk read: read 5 000 times 5 000 rows at once

The benchmark is performed on a 5-column table with the following structure:

- Auto increment ID
- Random text column with index
- Random text column
- Random integer column
- Random float column

I performed this benchmark on my laptop, a ThinkPad extreme gen 3 with an Intel i7-10850H CPU and 32Gb of ram. But you can try it for yourself using the code in this [GitHub repository](https://github.com/nicolasbeauvais/sqlite-benchmark).

![MySQL vs SQLite performance benchmark](/images/is-it-time-to-ditch-mysql-and-postgresql-for-sqlite/mysql-sqlite-benchmark.svg)

As you can see, SQLite is faster than MySQL except for bulk writes. This is a simplistic approach with a small amount of data. The point is that in most cases, SQLite is fast enough, and we just scratched the surface of what can be done to optimize it.

### SQLite is reliable

High reliability is one of the main selling points of SQLite, you probably have hundreds of SQLite databases on your Laptop and your phone, they are also used [in aircraft](https://www.sqlite.org/famous.html).

More importantly, SQLite is [thoroughly tested](https://www.sqlite.org/testing.html), with an impressive 100% of Modified Condition/Decision Coverage (MC/DC), and more than 2M tests with a ratio of 590 test lines for each line of code.

> SQLite's developers created their own version control system called [Fossil](https://www.fossil-scm.org/) to manage the development of SQLite itself.

### SQLite is cost-effective

As previously mentioned, SQLite is already bundled with common backend languages, so you don't need to pay for a separate database server. You can also do that by installing MySQL or PostgreSQL on the server that hosts your code, but that's not how they shine.

Due to its simplicity, you will also need less DevOps time to manage / secure / scale it = less money spent on DevOps.

### SQLite is straightforward to secure 

SQLite doesn't have a network interface, so it should not be exposed to the outside world making the biggest attack vector of traditional databases a non-issue. It also doesn't have a user management system, so you don't need to worry about managing database credentials.

You already need to spend time and effort to secure your application serve, and in most cases, that's enough to also secure SQLite. Quick win.

---

## Can it be a good fit for your project's production database?

Now that you are pumped and ready to start your next project with SQLite as the main database, I'm going to crush your dreams of simplicity.

Choosing a database is a big decision that will impact your project in the long run, and SQLite is far from a perfect solution for web applications, unless carefully considered.

The whole point of this article is to help you make an informed decision, so let's talk about the drawbacks.

### It will take some trial and error to use it properly

This first point is not specific to SQLite, but a friendly reminder about making the switch to any new technology. There will come a time when you are stuck and need to figure out how to do or fix something. Even if it's pretty close to MySQL and PostgreSQL, there are some behavior differences, mainly around transactions and migrations, that you'll need to remember every time that you do something to avoid killing your app.

> If you are proficient with a client-server database, with CI/CD pipelines, backups and infrastructure already figured out, you will get little benefits from SQLite.

### Not made to scale horizontally

The strength of SQLite is also its weakness, it stores everything in a single file, so you can't **by default** scale your application horizontally. A good amount of web application will never need to scale horizontally anyway, considering how easy it is today to get performant hardware. 

An SQLite database can grow up to 281 TB of data, but [as advised in the documentation](https://www.sqlite.org/whentouse.html) if you plan on growing your database in the realm of Terabytes, you will be better off with a centralized client-server database.

Vertical scaling has its own trade-off, and if you're a follower of the [Twelve-Factor App](https://12factor.net/) dogma, or need to deploy multiple instance for geographic optimization, it's still possible to create read-replicas of your SQLite database across a cluster of machines thanks to the [LiteFS](https://github.com/superfly/litefs).

LiteFS use a [FUSE](https://en.wikipedia.org/wiki/Filesystem_in_Userspace) file system to intercept the SQLite queries sent by your application. It then replicates the changes between your instances through an HTTP server.

You can get a deeper overview of how LiteFS works on [the project's architecture documentation](https://github.com/superfly/litefs/blob/main/docs/ARCHITECTURE.md).

While this works fine and allows incredible performance on read intensive app, it also removes many advantages of using SQLite. You need to take care of the LiteFS process on your servers and secure the ports it uses to communicate between replicas. Using FUSE also means that write transactions are limited to ~100 per second which might be a deal-breaker for write-heavy applications. 

![Simplified LiteFS](/images/is-it-time-to-ditch-mysql-and-postgresql-for-sqlite/litefs.webp)

Another limitation of LiteFS is that writes queries should occur on your primary instance. You could use a proxy to route write queries to the primary instance, but that's again more complexity to handle.

> LiteFS is stable and used in production, notably on [Fly.io](https://fly.io/docs/litefs/), but still in Beta. So you might encounter bugs or breaking API changes.

### Concurrency is limited

It's a recurring belief among developers that SQLite is not suitable for web applications because it can only handle one write at a time and data cannot be read while a writing operation occurs. 

While this is true by default, it's not as big of a limitation as you think thanks to the [Write-Ahead Logging (WAL)](https://www.sqlite.org/wal.html) journal mode.

What is a journal mode I hear you ask? Well, fear not as I will explain this to you in plain English. 

SQLite stores data in a single file that is internally split into pages. By default, when you execute a query that changes data, SQLite will copy the page that is about to be modified. This copy is called a journal file. 

This is done to ensure that if something goes wrong during the write operation, the database can be restored to its previous state, enforcing the [ACID](https://www.sqlite.org/transactional.html) properties of the SQLite.

When your write query is fully executed, SQLite will delete the previously created journal file.

![SQLite default journal mode](/images/is-it-time-to-ditch-mysql-and-postgresql-for-sqlite/sqlite-journal-mode-delete.webp)

> The full process is a bit more complex with [3 incremental locking mechanism](https://www.sqlite.org/lockingv3.html), but that's the gist of it. 

The issue with this default mode, called `DELETE`, is that it will prevent any read operation on the table that is being modified until the end of the transaction, which can considerably slow down your application.

Enter the Write-Ahead Logging (WAL) journal mode. In this mode, SQLite does the reverse operation by writing the requested change into the journal file first, avoiding any lock on the table. That way, concurrent read queries can still be performed on the main data while our write transaction is being executed. A reconciliation task is then performed to merge the data in the journal file with the main database, this is done automatically by SQLite.

![SQLite WAL journal mode](/images/is-it-time-to-ditch-mysql-and-postgresql-for-sqlite/sqlite-journal-mode-wal.webp)

> The WAL mode is not without its own set of tradeoffs, but it's a better default choice for most web applications.

The journal mode can be enabled by a single `PRAGMA` instruction and will persist once set on a database:

```bash
$ sqlite3 mydb.sqlite "PRAGMA journal_mode = wal"
```

### Limited migration support

Modifying your application schema is painful in SQLite, there are only four commands that can alter a table:

- rename table
- rename column
- add column
- drop column

If you need to do anything more than that, like changing a column type, or adding a foreign key in an existing table, you will need to get creative.

Of course, the open source community comes to the rescue. The most popular frameworks have abstracted this process to perform the most common modifications but read the documentation carefully, as SQLite support has usually a few caveats.

There are also standalone tools like [sqlite-utils](https://github.com/simonw/sqlite-utils) or [golang-migrate](https://github.com/golang-migrate/migrate) that help create smooth migration scripts.

### Limited data types

No need to go check the documentation every time you need to create a column, there are [only five data types](https://www.sqlite.org/datatype3.html) to remember:

- NULL
- INTEGER and REAL for numeric values
- TEXT and BLOB for everything else

Compared to most client-server databases, it's a very limited set of data types. Even more when you consider the latest generation of databases that can allow for more than 40 types with support for Vectors, Geospatial data, geographical data, or even IP addresses.

This is enough to store anything, for example, if you need to store a date, you can put it in ISO 8601 format in a TEXT column, or as a timestamp in an INTEGER column. 

SQLite provides a good set of functions that you can use to handle most common types like [date and time](https://www.sqlite.org/lang_datefunc.html) or [JSON](https://www.sqlite.org/json1.html).

```bash
sqlite> CREATE TABLE test(id INT, datetime TEXT);
sqlite> INSERT INTO test(id, datetime) VALUES(1, '2024-01-01 01:01:01');
sqlite> SELECT date(datetime) FROM test;
2024-01-01
```

Using an ORM with type casting should abstract this problem away, but it can get painful quickly if you need to enforce type casting in multiple backend / languages. Or you can ignore type casting if you're that kind of person that likes to live dangerously.

---

## Production SQLite in the real world

SQLite is used on billions of devices, but isn't as popular for web applications for the reasons mentioned above. There's a few notable large companies that run their main database with it, like [Expensify](https://use.expensify.com/blog/scaling-sqlite-to-4m-qps-on-a-single-server) and more recently [Tailscale](https://tailscale.com/blog/database-for-2022).

I won't list all small-to-medium web apps that run on SQLite, but a great example is Pieter Levels' [Nomadlist](https://nomadlist.com/) and [Remoteok](https://remoteok.com) that are both running with SQLite on a VPS that handle 50M+ requests per month for only $40. So if you think your application won't scale vertically, think again.

--- 

## Conclusion

Like with every decision in software development, there's no one-size-fits-all solution, and you will have to carefully evaluate the pros and cons of SQLite for your specific needs. Most developers tend to over-estimate how many resources a project needs to run, and underestimate the performance and benefits of simple "less shiny" solutions like SQLite.

A lot of web applications would benefit from using an embedded database, and if you do not plan on scaling horizontally, or have more than 1TB of data, it's a no-brainer to go with SQLite.

And if the need arises, migrating from SQLite to MySQL or PostgreSQL is not too painful.

---

## References

If you would like to explore SQLite further, here are some well-written resources that inspired this article:

- [Consider SQLite](https://blog.wesleyac.com/posts/consider-sqlite)
- [SQLite: Small. Fast. Reliable. Choose any three.](https://charlesleifer.com/blog/sqlite-small-fast-reliable-choose-any-three-/)
- [SQLite the only database you will ever need in most cases](https://unixsheikh.com/articles/sqlite-the-only-database-you-will-ever-need-in-most-cases.html)

As well as some read worthy documentation pages:

- [How SQLite Is Tested](https://sqlite.org/testing.html)
- [Appropriate Uses For SQLite](https://www.sqlite.org/whentouse.html)
- [35% Faster Than The Filesystem](https://www.sqlite.org/fasterthanfs.html)
- [SQLite As An Application File Format](https://www.sqlite.org/appfileformat.html)
- [SQLite on Wikipedia](https://en.wikipedia.org/wiki/SQLite)
