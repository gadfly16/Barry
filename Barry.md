# Barry:

## A programming language that just doesn't work

The best thing abour the language is its namesake, Barry the funky seal, who is
very lazy, loves fish curry and forestry and looks something like this, when
dreaming about interesting ideas: (\_\*\_) . That dot can be interpreted either
as punctuation or existence in it's entirety lying next to Barry.

## Your First Time with Barry

But enough of that serious business and let's talk about the fun part: the
interesting ideas of Barry. Let's wet our fins!

```
"Hello World!"
```

```
12.34                   >> is a Num idea
12.34 56.78             >> is a List idea of Num ideas
"I'm a quoted string"   >> is a Str idea
.                       >> is an All or True or Source idea, all the same
()                      >> is a Nothing or False idea, all the same
```

As you can see Barry thinks in ideas. So much so, that we won't state it every
time we counter an idea: we just say a List of Str. Some idea names are
intentionally _botched_ to remind us of the underlying digital representations'
limitations. Num is a 64 bit float in it's current representation, which is
adequate for our purposes, but it would be a bold overstatement to call it _the_
Number idea. Anyway, these are the so called _value_ ideas. _Evaluation_ is the
act of reducing an idea to a value.

```
1 + 2   >> evaluates to 3
```

1 + 2 is an idea tree, starting with an Add that has two branches a left and a
right one, something like this:

```
1 2
|/
+
```

This idea tree can be evaluated, Barry can try to reduce or in other words
collapse the tree to a single value. In this particular case this is possible as
the + _operator_ has both arguments so it can be reduced to the Num idea 3. Most
programming languages are designed with the main goal of best possible
evaluation in mind. Barry is designed around the goal to help the user create
the best _idea tree_ she possibly can. Every programming language has a similar
concept to the idea tree, usually called the abstract syntax tree, but it is
treated as an implementation detail, a temporary datastructure, that can be
thrown away. One's thrash is another's treasure: for Barry the idea tree is
_precious_.

## A Comment on Comments

The act of programming involves at least ten times more reading than writing
code. Probably much more, as you read back your own code constantly. Barry
treats readability as king.

```
   >> _this_ is an end Natlang or comment if you will
12 >>Inline Natlang>> 34 56
```

Natlangs are little snippets of natural language inserted into the program for
different purposes, mostly to describe _why_ are things the way they are.
Natlang is not an operator idea, so they aren't involved in evaluating the tree.
Nevertheless Natlangs are not discarded during lexical analysis during a
_parse_, they're prevserved on the idea tree as Natlang ideas and are only
removed in different stages of reductions.

## Smooth Operators

Barry uses a fairly standard set of operator ideas to express arithmetic
operations on other ideas.

```
1 + 1       >> evaluates to 2
1 + 2 * 3   >> evaluate to 7
```

Gouping ideas is also fairly standard.

```
12 (34 56) 78   >> an embedded list
(1 + 2) * 3     >> evaluates to 9
```

Do not worry, it only looks strange if Barry is not the first programming
language you've seen in your life. Operators and values are both gouped the
same.

## Now Barry is Different

Evidently Barry happens to be a little different in some departments, but
luckily these differences are mostly only from other programming languages.

The most striking of difference is how simple Barry it is. Like a spoon. In
Barry everything is an idea and as such, every idea interacts a little
differently with the idea tree. There are similarities of course between them,
so we differentiate value and operator ideas, but Natlang is neither, it's just
an other kind of idea. But it's still an idea.

What you read as examples above is the _language_: an encoding of trees of ideas
in a hopefully human readable form. _Everything_ you read in the code examples
is an idea in one way or another and you already familiarized yourself with
several one of these. Whitespcae is used to separate these ideas from each other
one way or another.

## List of Differences

Barry has a quirk, a tick, a bad habit. Barry compulsively turns Lists of one
single element into that single element. It's not that Barry has a problem with
single element Lists, it's that the two are indistinguishable for Barry from
each other.

```
(6) = 6             >> evaluates to .
6 != (6)            >> to ()
("fish") = "fish"   >> to .
```

And so on. We call this the _single element rule_. You might feel some nostalgia
for the ability to distinguish a single element list from that single element,
but it might sweeten up your mood to know that you can append an idea to a
single idea and that becomes a list ot that two ideas. You can add ideas to
nothing, or even everything. Which is epic!

## The Hardest Thing in Programming

If naming is the hardest thing in programming (not counting cache invalidation
which doesn't sound hard), then programming must be an easy endeavour.
Unfortunately naming involves the definition of boundaries around the things you
name. It's signigicantly easier to come up with name "seal" than to tell where
the concept of an seal starts and where it ends. You can stare into this abyss,
if you ask yourself the question if Barry is a seal or not.

```
x: 1         >> This is a labelled Num idea
x            >> evaluates to 1
1 y 3 y: 4   >> to 1 4 3 4
```

Names are created by Labels. Names are visible to Ref (reference) ideas in their
scope. The scope is a list of labels Refs _see_ from their _locations_ on the
idea tree. Basically they see labels in their own _list_ and labels defined in
their _parent_ ideas _upstream_ the tree.

```
x: 1 (x) (y: 2) y   >> y can not be resolved
```

Is it an error? Not quiet it just becomes an unquoted Str of "y". You might ask
how you can peak and poke into their children's minds, which is as we know
absolutely unavoidable. It won't come as a surprise that that's possible with
the All idea. What else!?

```
x: 1 (x) y: (z: 2) y.z   >> evaluates to 1 1 2 2
```

## A Single Source of Soot

Most code examples until now were hopefully single line snippets. It's entirely
possible to write large programs of arbitrary complexity as a single line in
Barry, but some find this unconvenient so, Barry patiently supports multiline
programs as well.

```
a: 1
b: 3
a + b
```

This three line snippet is evaluated and reduced as one single unit. Now if a +
b is a tree as we know, 1 and 3 are single leafs and single leafs are trees,
than this is a forest! Luckily forests are a List of trees and a List is an idea
on the idea tree, so forests are trees! From this also follows that trees are
also trees! Anyway, in Barry the above code example produces _exactly the same_
tree as the one below.

```
a: 1 b: 3 a + b   >> the same as above
```

It's the same, just written somewhat differently. With sweet-sweet conventions
we can use _lines_ in a file to our advantage to eliminate the numbers of ()s
needed to express the explicit nesting structure of the code. Every line _is_ an
implicit List, just as the entire set of lines is an implicit List.

```
a: 1    >> is a list of one idea as a line is a list like (a: 1)
b: 3    >> also
a + b   >> also, as it's one Add idea so it's ((a: 1), (b: 3), (a + b))
```

And that List of Lists is collapsed by the single element rule into a single
List of three elements. The two _layout_ produces the same tree.

Now, the program you write can be as many nested layers ideas as you see fit,
nevertheless the idea tree always roots from _one single idea_. And this root
idea kind of represents the entirety of the idea tree. We call it all or the
Source in this particular context for this reason and it is written as . .

```
rip .   >> Good bye!
```

rip sends the Source to a one way trip somewhere. In other systems it would be
called something like "deletes the source" or worse, but that's just rude. And
Barry also thinks it's kind of silly too, as he doesn't see how _ideas_ could be
deleted at all. Barry justs send them away with rip, when they're not
interesting enough to waste precious memory on them.

## Going Deep with Barry

We can use indentation to spilt long lines and to change the layout direction of
the undrelying List.

```
>> A List of three elements
1
  2
  3

1 2 3   >> The same tree in one line
```

Indentation is just a layout trick that tells the parser to continue the line
but with List elements following vertically.

```
1
  2 3
  4 5

1 (2 3) (4 5)   >> seems more useful
```

The next example intended to look and feel fairly familiar.

```
fish: (
  "Kilgore Trout"
  "trout"
  1 )

fish: ("Kilgore Trout" "trout" 1)   >> funky but fishy
```

## Only Love is Unconditional

Conditionals are just operators with three arguments, the first being the
condition, then the idea to return in case the condition is True and lastly the
idea to return on False.

```
if 3 > 2 "Yay!" "Neh."   >> evaluates to "Yay!"

>> the same, just with a different layout
if 3 > 2
  "Yay!"
  "Neh."
```

The So operator can come handy in conditionals.

```
x = ()
if ?x "Something." "Not much."
```

## The Name of All Things Except Nothing

If naming is the act of dividing All and hanging Labels on these divisions, then
it seems logical to use all as an operator on names.

```
fishes: (
  name: "Kilgore Trout"
  kind: "trout"
  count: 1 )

fishes.name   >> evaluates to "Kilgore Trout"
```

If you start a name with . that name will be looked up in the topmost list of
the tree.

```
x: 1
p: (
  .x
  .x + 1 )

p   >> evaluates to (1 2)
```

Of course you can divide all, further with all more all operator name pairs.

```
p: (
  x: 1
  y: 2 )

p`: (
  x: .p.y
  y: .p.x )

p`: will evaluate to (2 1)
```

There must be no whitespace between the all operator and the name, as with
whitespace after it, it's parsed a an all _value_ instead of the all _operator_.
OK, well, yes, all is overloaded. There's an all value and an all operator.
Please don't tell anyone. Anyway, that's an exception and since all represents
_everything_ we could have botched it much more. Actually we did, but it's too
early to confess that yet.

## Now It's Family Matter

Children can access their parents by piling multiple All operators.

```
a: 1

b: (
  ..a      >> is 1
  c: (
    ...a   >> is 1 ) )
```

Now since parents and childs are relatives, we call this a relative reference
and because all is everything and _the_ absolutely True, we call references with
a single starting . absolute references.

Barry stronly believes in the privacy of families, so it prefers this _relative_
naming over abolute ones. Absolute references are epic but also fragile.
Relative names _move with_ the parents if the parents are relocated on the tree.

## Magic Forestry

Forests are magical, trees are magical, seals are magical. Everything is
magical. Is nothing magical? Is nothing something? Anyway, trees are especially
magical in the context of computing, because they grow _downwards_. Luckily this
doesn't seem to bother anyone.

Either it's because in western cultures we read left to right, top to botom, or
it's because of our endless sympathy for oppressive top down power structures,
this became the norm: trees grow downwartds. Root is at the top, leafs are at
the bottom of these "trees". Which are actually roots if we look at them this
way. There was have been some _actual_ attempts to call them roots, but that
most probably made it kind of hard distinguish the root from its root. So that's
that. Once you see it, you can't unsee it.

Luckyily roots are trees topologically, so I guess everyone just looked the
other way. Including Barry. Barry says it's best to think about _these_ trees as
ones growing on the _inner_ surface of a hollow planet. Now, that's Barry. What
you should take away is that when we say _upstream_ we're talking about flowing
in a children to parent direction and when we say _downstream_, about flowing
from parent to children direction.

## Seals Are Funky!

As we all know, seals are magical creatures. Now to add just a touch of mystic
sheen to the syntax - that can appeal to the opposite sex if the oposite sex is
male - sometimes we use squiggles to name things. In reality these are seals.
For example the add idea is represented as + in the code. Now that's a seal,
probably a very positive one. Seals increase magical cuteness of the code,
making it more readable and shorter. 1 add 1 is absolutely readable but 1 + 1 is
shorter and strains the brain even less. You already encountered several seals
like : for Labels, the arithmetic operators + - / \*, >> for Natlang, etc.

The good news is that seals are just _names_. OK, _some_ seals are different of
course and behave their own quirky ways, like Latlang for example, that serves a
special purpose. Luckily there are only a few outliers like that, and if Latlang
didn't raised your eyebrows, I don't think the others will.

## The Truth About Barry

```
3 = 3   >> evaluates to . or all or true
```

Again, it only looks botched if Barry is not your first programming language. It
reads "three equals three" and that's our idea of Eq that evaluates to either .
or () . Usually Barry funks, but when the topic is equality he can get pretty
dramatic: it's All or Nothing question suddenly.

```
3 != 4   >> evaluates to . as != represents the Inequal idea
. = .    >> to . as everything is everything, as we all know from the song
() = ()  >> to . as nothing is nothing, there must be a song about this
3 != ()  >> to . as 3 is something and that's not nothing
3 != .   >> to . as 3 is not everything
```

And so on. Barry is usually deeply liberal, but as an exception takes equality
very seriously. Luckily for the rest of us here is the So idea represented as a
? in the code.

```
?3       >> evaluates to . because 3 _is more like_ everything than nothing
?0       >> to () as the poor thing resembles to nothing more than everything
?(0 0)   >> to . as a list of two things involves the number of two and that's more like everything
```

Yep, I know, but at least Barry sees the world through this star shaped glass.

## Coming Together with knitten

Because we love animals we call the idea to appending to a list Cat _who_ is
represented as ~ in the code. Cat is one of the closest friend of Barry, so we
sometimes refer to Cat as knitten. Anyway, you can call appending to a list
"catenation" or "knitting", they mean the same.

```
(1 2) ~ (3 4)         >> evaluates to 1 2 3 4 as ~ knits the two lists together
"Hello " ~ "World!"   >> to "Hello World!" as Strs can be knitted
() ~ "fish"           >> to "fish" and that's awesome
. ~ "fish"            >> to . which is a no-operation on a cosmic scale
1 2 ~ 3 4             >> to 1 (2 3) 4 for questionably obvious reasons
```

Cat catenates List or Str objects together, and she is tireless. Because a list
of a single element is indistinguishable from that single element, catenating
single ideas and lists behaves the same.

```
(1 2) ~ 3   >> evaluates to 1 2 3
1 ~ (2 3)   >> also
```

## Stranger Strings

Barry in it's ethernal wisdom distinguishes quoted and unquoted strings or Str's
to be more pretentious.

```
"fish" = "fish"                 >> always evaluates to .
fish = "fish"                   >> might evaluate to . or not
fish: "Herring" fish = "fish"   >> evaluates certainly to "Herring" ()
```

An unquoted string parsed as an Str if it's content don't point to a visible
label. The last example might seem a bit fishy, but that's just a List of a
labelled Str and a comparision operation between a Ref and the Str "Herring".
Now, we poured clear seawater into the glass.

That takeway is that use quoted strings if you want to be sure to produce a Str
idea and that if you want to refer to have a chance to look up a name just
don't.

This might look silly at first, but it might actually be a good idea. Or not.
Kidding. If you're unsure, you can think about unquoted strings as hoisted name
references not yet resolved.

## The Tip of the Iceberg

To be entirely honest, that was just the tip of the difference iceberg. Barry
can look so alien bacuase it is _used_ rather differently than other languages.
Other languages build temporal abstract syntax trees during transforming the
input text into some executable target. Barry loves forestry so it doesn't throw
away the idea tree it produces. On the contrary, it looks at it as its main
product and reuses it for all kinds of purposes.

Barry alows the user to define _and_ manipulate trees of ideas that are in
reality are _just_ objects defined in the underlying implementation language.
Barry translates these trees back and forth from textual representation as the
embedding application or the user interface requests. In other words Barry is a
bidirectional language as it can produce the source of an AST that produces the
same AST parsed back.

## OCD for Lazy Persons

Among other things, this means that Barry is it's own formatter. As Barry is
liberal at heart, the parser accepts a lot of input that looks a bit different
when Barry views it. Barry's view is called the _standard notation_ or sn for
sort.

```
1+1                                 >> sn is 1 + 1
"Wily" >> Fish! >> "hake" "knitten"   >> sn is "Wily" >>Fish!>> "hake" knitten
```

This architecture has the potential to bring **world peace** itself closer to
reality by rendering the tabs vs spaces kerfuffle moot, once and for all. At
least in the context of Barry.

## I Wants to Get Funked Up

It's no wonder, as "Funk is the absence of any and everything you can think of,
but the very essence of all that is", as Bootsy Collins nailed it so precisely.

```
f: x -> x * 2 + 1            >> an operator definition, incidently a function
f 3                          >> evaluates to 7
f': a b -> a + b             >> multiple function arguments
f' 1 2                       >> evaluates to 3
hw: -> "Hello " ~ "world!"   >> a pure function with no argument, epic
```

With the opdef idea which is represented by -> you can define a new operator. If
you hang a label to the operator definition, you can even use this operator
elsewhere in your source, which seems useful.

You might be a bit disappointed to hear about operator if you wished for
functions for christmas. Luckily functions are just operators that happens to be
pure as fresh arctic snow, at least in the sence, that they're deterministic.
Basically they evaluate to the same result given the same arguments. Since all
machine instruction changes the state of the underlying machine, even the deeply
admired nop instruction increments the program counter, Barry think it's better
to lift this somewhat unrealistic requirement of not having side effects on
functions. Now just as in case of pills, we still prefer functions that _don't_
have side effects, or at least have as few as absolutely necessary. Anyway Barry
acknowledges that sometimes they will, and looks the other way.

Now, that both imperative imperials and somewhat functional rebels are happy, as
they can call Barry a traitor, we can raise the question: what the hake is an
operator anyway? It's simple. An operator is a list that evaluates to its last
element instead of the entire list. Basically inside of an operator you can use
the operator's list as a playground and only return what you want from it, after
you fooled around.

```
f: -> ("first" "second" "last")   >> function with no argument
f                                 >> evaluates to "last"
```

Now that's silly, you might think and you're absolutely right as Barry _is_
silly. Anyway we can try and use Barry's sillyness to our advantage.

```
f: x ->
  y: 12
  x + y
f 3       >> evaluates to 15
```

In this case returning the last element makes more sense as otherwise the result
would be y: 12 15 . A list of a labelled constant _and_ the result. Now, nobody
wants to see those innards, are they? Anyway, you can approach the idea from the
angle of multiline codeblocks in other languages, which can help to turn your
head to the right direction, but it also becomes misleading soon as Barry has no
_real_ concept of lines. Only lists.

If you happen to be very clever, you might already suspect, that the the source,
the top level of the tree itself is an operator and evaluates to its last
element, and you would be spectacularly wrong. It's not. It's _just_ a list. If
you want the source to act like an operator you have to explicitly state it.

```
->
  a: 1
  a + 1

>> now . is an operator and !bang . would evaluate to 2
```

A blank idea can be used to signify the location of the operator name in the
argument list and to define postfix and infix operators.

```
%: v _ p -> v * 100 / p
2000 % 50                 >> evluates to 1000
```

Barry's a great fan of the modulo operator and sees the utility of percentages
much fainter, but if the programmer decides to redefine % to her own liking, he
just looks the other way and thinks about something else. Names propagate
downstream so such a redeclaration is only visible to the descendants of their
context.

Not all operator ideas are nice enough to call them functions though. Some
operators are designed to evaluate to different values on different calls, like
random generators and time related operators for example. Some even change the
state outside of their own family.

## Mutators are Volatile

Not everybody likes mutants the same, but everyone has a place in Barry's huge
heart of warmth. Barry has no problems with mutants, and he quietly suspects
that, somewhere deep inside everybody might be a mutant.

```
->
  x: 3     >> evaluates to 3, just a labelled Num
  x := 4   >> to 4, using a set operator idea on x
  x        >> to 4, operator returns 4
```

Set is a mutator idea as it _changes the idea tree_. In Barry, name resolution
stops at operator definitions, so you are only able to mutate things inside of a
function itself and downwards this way. Most operators are meant to return so
what they are doing inside themselves until they are deterministic is something,
that Barry is just to lazy or liberal to care about.

```
x: 3
m: y -> ..x := y   >> m is a new mutator operator
m 4                >> evaluates to 4
x                  >> to 4 as value has been mutated
```

Non-deterministic functions are usually also mutators in some sense as otherwise
they wouldn't be very useful. A random generator either needs to advance a seed
somewhere outside of the function or rely on something that is constantly
mutating anyway. Counters and clocks the same. What's important is that mutators
can be discovered by examining the tree without ambiguity.

You might ask what happens if you evaluate this source again? The short answer
is it evaluates the same, because x: 3 also reevaluates during reevaluation.
After running a source Barry might show you the end state of the tree _after_
returning with all the effects and end results of mutations occured on the tree,
but it always _keeps_ the source's state _before_ evaluation. Because the source
is that: the state of the idea tree before the bang.

There are some fundamental mutators like rename and rip and you can write your
own ones to botch up the tree anyway you see fit. Basically Barry lets you edit
the source and bang it several times until it proves useful.

## It's Just a Matter of Time

... to develop at least some sympathy towards Barry. Now it's also just a matter
of time _when_ mutators change the tree. Since all labels are visible in the
current context from the current context, independently from their order in
their list, until you use function operators the order of execution doesn't
matter.

```
a: 1 b: 2 a + b   >> evaluates to 1 2 3
a + b a: 1 b: 2   >> also
```

With mutators execution order can change the outcome.

```
->
  a: 1
  a := a + 2
  a := a * 3   >> evaluates to 9

->
  a: 1
  a := a * 3
  a := a + 2   >> evaluates to 5
```

Mutators execute in a left to right top to bottom fashion, exactly in the
_order_ of their underlying lists.

## Time to Talk About

The concept of time can be confusing and intimidating, and is also a source of a
never-ending stream of misunderstandings among otherwise seemingly intelligent
beings. It also happens to be one of, if not the single most important invention
of all times. Time is an abstraction of change. The discombobulation roots from
the simple fact that time happens to only exist in our imagination.

Time travel is _actually_ possible, in fact it's quiet easy, given you accept
the fact that it's only possible in your imagination, because time itself
happens to only exist there. In other words, what exists in a perceptible and
measurable fashion is _the moment of now_ and _change_. Change is a bit tricky
as we need memory to compare two moments, which is implemented in the reality
that's changing. Luckily Barry also happens to deal with imaginary abstractions,
so we don't have to deal with these disturbing details. Time travel is a breeze
with Barry.

## It's Time for Time to Begin

If you're as unhinged as Barry is, you might even raise the question, what's the
difference between a change initiated by the user and a change initiated by the
tree on itself by a mutator? In a sense not much: the idea tree just changes for
whatever reason. On the other hand if the change is initiated by the tree
itself, it is deterministic, so we can reproduce any number of those changes
given an _initial state_ to start from.

The act of starting the idea tree to mutate is called _bang_, because "banging
the source" sounds much more appropriate and family friendly than "executing"
it. That's progress, happening right before your eyes.

```
!bang .   >> start mutating the source
```

The ! before the operator tells Barry that this request is coming from the
_outside world_, in other words it's _not_ part of the source. Then what is it?

## Kepp it Simple Silly

Mutators are fun, mutators are necessary and mutators allows the programmer to
express algorithms orders of magnitudes slower than their pure functional
counterparts. Which usually also happen to read better and on the long run
easier to reason about.

Branches without mutators can be _simplified_ confidently, while parts with
moving part are just not. Basically parts targeted by mutators must held intact
during evaluation.

```
1 + 2 * 3           >> no moving parts can confidentally simplified to 7
t: 1 + (m: 2) * 3   >> must kept intact
t.m := 3            >> now t evaluates to 10
```

These toy examples are just quick demonstrations of the underlying phenomenon,
they doesn't really show the possible implications this can have.

Luckily Barry is doing everything in it's power to help you bring your source to
the best shape you can. Simplifications done by other programming languages are
kept from the programmer most of the time. Barry can suggest and apply
simplifications on the idea tree as you edit it, and can show how a mutator
holds a section hostage, my marking locations targeted my mutators.

Often mutated parts can kept isolated and as these parts are usually data
structures and not program code. Not being able to simplify those is a much
lesser problem as it doesn't affect performance that much and kind of natural
too.

Theoretically with mutators you can write code optimizers on functional parts of
the tree that will produce functions specialized on a large input. For example
you can produce a grep optimized for specific settings that will run faster on
large datasets than a generic one.

## Measure Twice Cut an Infinite Number of Times

Barry calls information originating from the outside world _measurements_.
Measurements are information that Barry would be not able to recreate for the
exact reason that they are originating from outside the idea tree. Measurements
get recorded as time series data, for the exact reson: that they are
unreproducible by Barry.

This can happen during an ongoing bang, for example a game can record every
keyboard stroke and mouse input coming from the user and from that Barry can
reproduce the entire game run later. Which is neat.

Even more interestingly the _source_ itself is treated as a measurment: a
measurement of the quantum state of the programmer's brain, regarding the best
possible idea tree it can produce at the given moment. Because of this, changes
on the source code by the programmer get recorded in exactly the same
infrastructure. And that's version control from Barry's viewpoint.

## Fish Curry Funks Good

Now that was dense, so let's talk about the relaxing topic of operator currying
or incomplete operators as we call them, to help resist the constant urge of
inapropriate kitchen jokes.

```
(*)     >> just a Mult with no argument
(_*_)   >> the same, but cuter
```

The second line exemplifies how you can make simple topics harder to understand
by throwing insignificant details on your audience. The first line is just a
simple Mult idea _without_ attributes. The second also. Barry just calls them
incomplete operators. In themselves they are not reducible to a single value,
but they can be used as operators themselves, by giving them their missing
argument.

```
addFive: (+ 5)
4 addFive        >> evaluates to 9
```

A blank can be used to leave argument slots unfilled explicitly. This way you
can leave out arguments in the middle of the argument list.

```
clear: filter _ ?
clear (0 1 2 1 0)   >> will evaluate to 1 2 1
```

The \_ seal represents the idea of a blank. A blank is _not_ a null value of a
kind: it explicitly says that "this argument is unfilled". Incomplete operators
can come handy as lambda functions.

```
filter (1 2 3 4 5 6) (%2 = 0)   >> evaluates to (2 4 6)
```

Incomplete operators can be used as any other idea.

```
ops: (+1) (-2) (*3) (/4)   >> a list of incomplete operators
map ops 5                  >> evaluates to 6 3 15 1.25
```

## To Infinity and Beyond

Computers are awesome. If you're dealing with trees. Otherwise not so much.
Let's suppose I decide to build an application that let's me sculpt with my
computer. After some years of heroic effort, which if succeds it most probably
involved trees to effectively store and process the clay particles and/or
voxels, I end up with a most probably useful and marketable tool, that's
inferior to the real thing, a kilgoram of good quality sculpting clay. If you're
not convinced think of sculpting as a quantum domain specific programming
language that runs on the most advanced specialized quantum computer humanity
could came up with during the milennias.

On the other hand, if you want to deal with a large number of numbers, organized
into labelled trees, now then computers are absolutely awesome. Luckily dealing
with trees of the likes also happens to be the _easiest_ thing to do with
computers. Barry suspects that these two things might be related.

When I want to output the standard notation of the idea tree I just need to
write the stdn method on every idea, including list's which handles the layout.
A Num will output it's value, + a "+" character and its left and right
arguments. Ideas just need to call the same stdn method on their arguments or
elements and the _tree renders itself_. I just render the ideas themselves, the
tree emerges from the links between the ideas.

It's called recursion: a function calling itself. Walking trees is just one
example of what you can do with recursion. The other one is loops. A function
calling itself is basically a loop. If there is no stop condition it's an
infinite loop, which is the basis of application experiences and networking. Now
there's the problem of the menace of an ever growing stack with each call. The
truth is that if a recursive function returns the result of the recursion
verbatim to the caller, then ther's no need for a new stack frame. Even Barry
can recognize these ghost frames and under the hood it passes back the result
directly to the first function in the chain.

Since in Barry the last line of an operator is the return value this pattern is
easily recognizable in the stdn too.

```
count: i lim ->
  if i = lim
    i
    count i + 1 lim
```

This should be as effective as its while or for equivalent.

## Cache is King

Now the easy part: cache invalidation. Imagine that you succeeded to build a
source that you like so much, that you want to bang it multiple times. You also
happen to work on one of two computationally expensive branches. You practically
don't touch one of the expensive branches. You're probably the patient type if
you reached to this point, but evaluating one branch is a pain in the tail in
itself, so it would be nice to _store_ the result instead of calculating it.

When reading back a result from possibly persistent storage is faster than
calculating it constantly over and over, everybody thinks about caching, a sighs
with great-great resignation.

Barry's slow but mostly deterministic behavior guarantees that any result
arriving the tree can be confidently cached. Cache invalidation propagates
upstream kind of obviously. One of Barry's favourite occupation is rebuilding
caches from other cached sub branches. What makes Barry scratch his head - which
is harder for seals than you think - is _what_ ideas to cache. Which locations
on the tree are the best candidades for caching?

Barry plays a little game in his head, to come up with acceptable answers to
this question. He assigns a _cost_ to ideas, because for an eternal being the
idea of _a_ cost is morbidly enertaining. So Barry immediately assigns _three_
costs to ideas, because that's even more entertaining. These are time, storage
and bandwith. From these three associated cost, Barry can figure out what ideas
are good candidates for caching in the _current_ sicumstances of available
resources.

Interestingly enough from this perspective we can think about measurements as
ideas with _infinite cost_, because they just cannot be reproduced by any means.

## The Hyperdimensional Telescope

The vector idea allows accessing list elements procedurally, either numarically
or symbolically.

```
(1.1 2.2 3.3)[1]   >> evaluates to 1.1
fishery: (
  1 2 3
  4 5 6
  7 8 9 )
fishery[3 3]       >> evaluates to 9
```

But of course Barry starts indexing elements from 1. He _is_ slow. And a bit
simple too. Even he acknowledges that we loose a considerable amount of
identifiability with this as programmers, but on the other hand with this
convention the index of the _first_ element is _one_, the second's is two and
the 100th's 100. Anyway, Barry is simpleton, so he considers the ability to talk
about element positions and indexes without ambiguity a little win. An infinite
number of little wins, to be precise.

```
fish: "hake"
fishy: "Kilgore Trout"
what: "fish"
.[what]                  >> evaluates to "hake"
.[what ~ "y"]            >> evaluates to "Kilgore Trout"
```

## Now Let's Botch Vectors

Nice. The only problem being is that those are not vectors, you might say. Barry
can hear you, so he botched the idea of vectors into a different idea called vec
that's the vector counterpart of num. Now vec is much more suitable for vector
algebra and similar operations, for what puproses the vector idea is completely
and entirely useless.

```
{1 2 3}   >> the ominous vec idea
```

## Units of Common Sense

The idea of the number is _so_ amazing, that even its botched little cousin num
is quiet amazing. Num can express cute tiny and huge epic numbers alike. You can
express the number of atoms in the universe with it, or at least _your idea_
about that. At the same time numbers start to behave like an ant nest under the
supervision of over-curious nine year old boys, when they are dealing with real
world data. Whatever the hake the term "real world" means.

To avoid avoidable discombobulation Barry decided to look at quantities and
units through his star shaped pink eyeware, and treat them with the love they
deserve, to save precious hours of sleep time. Basically Barry thinks that
quantities and units are _good_ ideas.

```
<- .sf.physics
t: 1s
l: 2m
sum: t + l   >> evaluates to 1s + 2m
```

Now that's unusual! What's going on? Again it's only weird if Barry is _not_
your first programming language. Those are units defined in the standard
fantasy, the closest thing Barry can think of a standard library. s and m are
ideas of physical units, second and meter to be specific. They're just operators
that accept a left argument (\_s) (\_m). Parsing the above text (without the
import) produces the following idea tree:

```
1 2
| |
s m
|/
+
```

And that's exactly what you see there. As Barry can recognize that he can't
reduce a value representing time and another representing length to each other
so the idea tree can't be simplified further.

```
t: 3s
t + 2      >> evaluates to 3s + 2
t + 1min   >> to 63s
t * 3      >> to 9s
```

You can't add a number to a second meaningfully, as not having a unit means that
the number is _not_ a quantity: it's just a number. But you can most certainly
multiply a quantity with a number. A unit imply both quantity the unit expresses
_and_ the conversion functions necessary to convert the underlying number to the
quantity's _base unit_. Units are treated as an interface layer, the underlying
representation is _always_ the same base unit. Barry suspects that of units may
have somehow related to the concept unification, but he is quiet about it to
avoid ridicule.

## What Type of Question is That!?

Everybody love types - including Barry -, as they seems to help us a great deal
to keep our sanity. It just happens that Barry likes ideas more, as he doesn't
care about sanity that much. To be honest, it's probably because he's just too
simple to comprehend the idea of sanity adequately.

Barry thinks that 1s describes what it attempts to describe fairly well: it's
parasble, it's displayable and it even seems to be flexible enough to swap s to
min if needed, since the underlying value is in the base unit of the quantity it
represents.

```
second: (s)        >> uncomplete operator expressing the idea of a second
minute: (min)      >> same for min
t: 90 second       >> evaluates to 90 s
!rebase t minute   >> mutates the tree
t                  >> evaluates to 1.5 min
```

Yep, the idea of a second can be expressed as an uncomplete operator, passed
around as any incomplete operator. Rebase swaps an idea leaving the incoming
attributes intact. Instead of types Barry thinks about trees of ideas
representing a compound idea, like a quantity of time. But you can still
disassemble these compound ideas and assemle them to your heart's desires.

Even better they can naturally _grow_ to express more complex ideas.

```
bithday: 1970 years
birthday s ago        >> time dependent, but evaluates to a num-s tree
```

Birthday's value will change as the clock of the underlying computer will
advance. The underlying value never changes, it's just an operator that outputs
the value relative to the clock: the idea of "ago". It's just an interface
thing. But what happens if you _give_ a value to Barry in that form? I'm glad I
asked!

```
bd: 50 years ago
```

Over a certain age you might be tempted to define your birthday in that format
as it will stay the same the next year. Unfortunately since Barry is an eternal
being who likes honesty better than its opposite, this won't do the trick. The
next year bd will evaluate to 51. Why? When you gave your birthday this way,
when Barry read it, it stored the value you described in the underlying base
format of time: a single point in time 50 years ago. Whenever Barry redisplays
the tree, ago will do the conversion again, so it will _appear_ like value had
change.

What's great about this that ago knows about itself that it's time dependent, so
it can register itself as such, so the interface can update it regularly as time
progresses.

## Obscure Objects of Desire

Excellent! So why on Earth are we talking about quantities and units in a
language definition? You must have run out of language specifics and you're
trying to show off desperately with this. Really!? No, not really.

I needed to show that Barry is in a state of grace where he doesn't have to
simplify everything to a single _value_ of a certain _type_, as most other
programming languages does. Other programming languages would define the type of
time and would equip it with all kinds of bells and whistles that can do
everything a value of time does, like parsing, displaying, validating, adding,
multiplying, etc. And 1m + 1s would most probably result in an error. As it
should since it's nonsensical to add a length to a time. Or should it?

Imagine that we already learned to define our own units, and we created a unit
of herring and hake. Is it an erroneous to say 3 hake + 5 makarel?

```
h: 3 hake
m: 5 makarel
s: h + m       >> evaluates to 3 hake + 5 makarel
s + 3 hake     >> evaluates to 6 hake + 5 makarel
s * 2          >> evaluates to 6 hake + 10 makarel
```

That seems useful. Barry prefers _simplified trees_ as results over errors.
What's strange is that these so called units show some resemblences to types,
which is weird as they are operators. How does it works? Did Barry figured out
how to add and multiply trees? Not to hurt anybody's feelings, but that seems
too complicated for Barry, even to comprehend the problem's complexity.

## Quantifying Metaphysical Values

No. Barry didn't figured out how to add two trees together. For him it took
epochs, even to figure out how to figure out how to merge trees properly. Barry
uses the idea of meta-data to escape fishy situations like this.

During evaluation units attach meta-data about the value to the value and return
these bedazzled values back to their callers. So 1s + 3s works, because +
receives 1 and 3 and by examining the attached meta-data it can decide to add
them or not, making simplification possible. +'s task does not ends here, as it
yet has to create the _tree_ of the result, again based on the info in the
arguments' received metadata. Barry abbreviated meta-data using the first
syllable from the first word and the second syllable from the second word, which
resulted meta. When Barry talks about meta it means metadata. Meta is
represented in the sn by the @ character.

To be honest we already used metadata as natlangs are stored as metadata.

```
a: 1          >> oh my!
a.@.natlang   >> evaluates to "oh my!"
```

@ is a name defined for every idea and is like any other idea. All units has to
do is to return the enriched values.

```
s: v _ ->
  (v @:(quantity: "time", unit:"s"))

myTime: 5s
myTime.@.quantity   >> "time"
myTime.@.unit       >> "s"
```

It's not how it's done, but that's the gist of it. Metadata is invisible to the
single element rule so s won't return a list, just the value, but the meta will
be there for + to access it and make decisions based on that.

The good thing is that you can define your own metadata just the way you want.
You can express types, classes, kinds or any other kind of constraints,
documentation as we already do with natlang and so on.

## I See! So What is Barry Anyway?

Because it's not a programming language, that's for sure. The short answer is
that Barry is an abstraction over the Nemannian computer model that tries not to
botch the model. Just kidding! Barry is a funky seal of course.

Barry is not a programming language. It's a proposal for a programming
environment where code and data is abstracted together with the same primitves
and even more importantly, where the abstact syntax tree is considered to be the
main product of programming. You can solve problems by simlifying this tree and
you can create application by running or banging this trees ad infinitum, which
is simplifying and complicating the tree recursively.

While it can feel alien - as Barry _is_ an alien technically -, but it is built
or dreamed up from off the shelf components, and widely adopted techniques.
Nothing exotic really.
