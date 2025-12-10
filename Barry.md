# Barry

## A programming language that just doesn't work

The best thing about the language is its namesake, Barry the funky seal, who is
pretty lazy, loves fish curry and forestry and looks something like this, when
dreaming about interesting ideas: (\_\*\_) . That dot can be interpreted either
as a punctuation mark or as the entire existence lying next to Barry.

## Your First Time with Barry

But enough of that serious business and let's talk about the fun part: the
interesting ideas of Barry. Let's wet our flippers!

```
"Hello World!"
```

Yep, I think that's the closest Barry can get to the only mandatory requirement
of modern, general purpose programming languages.

```
12.34                   >> is a Num idea
12.34 56.78             >> is a List idea of Num ideas
"I'm a quoted string"   >> is a Str idea
.                       >> a Bit idea, with an All or True or Yes value
()                      >> a Bit idea, with a Nothing or False or No value
```

As you can see Barry thinks in ideas. So much so, that we won't state it every
time we counter an idea: we just say a List of Str.

Some ideas have multiple official names we can refer to, most obviously the
values that a single bit expresses. This might be strange at first, but these
names are just answers to the question: what can be expressed by a single bit?
The traditional answer to this question in computer science is truthness, like
true or false, but Barry thinks that a single bit can also express the extreme
limits of extent and that's kind of a better name. Nevertheless, these are just
multiple names assigned to the same concept.

Some other idea names are intentionally _botched_ to remind us of the underlying
digital representations' limitations. Num is a 64 bit float in it's current
representation, which is adequate for our purposes, but it would be a bold
overstatement to call it _the_ Number idea. Anyway, these are the so called
_value_ ideas: Bit, Num, Str and List.

List is the only compound value idea in Barry.

## Fifty Shades of Snow

Whitespace is meaningful in Barry, which is kind of relatable knowing that Barry
lives on seemingly infinite fields of snow covered icesheets. Another argument
in favor of this is that whitespace is meaningful in every language: a
sweetheart and a sweet heart have entirely different meanings to Barry.

Luckily meaningful whitespace rules are rather minimal and will be covered
explicitly when applicable. Be prepared to swallow some meaningful indentation
rules and some pretty resonable operator overloading where whitespace will
actually _help_ to maintain recognizability of different but somehow related
ideas.

The most important meaning of whitespace though is to append elements to a list.
`1 2 3` is a list of three numbers because of the whitespace between each
number!

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
_parse_, they're preserved on the idea tree as Natlang ideas and are only
removed in different stages of reductions.

## Smooth Operators

Barry uses a fairly standard set of _operator_ ideas to express arithmetic
operations on other ideas. _Evaluation_ is the act of reducing an idea to a
value.

```
1 + 2       >> evaluates to 3
1 + 2 * 3   >> evaluate to 7
```

Grouping ideas is also fairly standard.

```
12 (34 56) 78   >> an embedded list
(1 + 2) * 3     >> evaluates to 9
```

Operators and values are both grouped the same way, with ()s. Do not worry, it
might look strange if Barry is _not_ the first programming language you've seen
in your life.

1 + 2 is an idea tree, starting with an Add that has two branches a left and a
right one, something like this:

```
1 2
|/
+
```

This idea tree can be evaluated, Barry can try to reduce or in other words
simplify the tree to a single value. In this particular case this is possible as
the + _operator_ has both arguments so it can be reduced to the Num idea 3. Most
programming languages are designed around the concept of evaluation. Barry is
not. Barry is designed around the goal to help the user create the best _idea
tree_ she possibly can. Every programming language has a similar concept to the
idea tree, usually called the abstract syntax tree, but it is treated as an
implementation detail, a temporary datastructure, that can be thrown away after
something evaluatable has been produces.

One's thrash is another's treasure: for Barry the idea tree is _precious_.

## Now Barry is Different

Evidently Barry happens to be a little different in some departments, but
luckily these differences are mostly only from other programming languages.

The most striking difference is how simple Barry it is. Like a spoon. In Barry
_everything is an idea_, where every idea interacts with the idea tree a little
differently . There are similarities of course between several of them, so we
differentiate value and operator ideas for example, but Natlang is neither, it's
just an other kind of idea for a different purpose. But it's still an idea.

What you read as examples above is the _language_: an encoding of trees of ideas
in a hopefully human readable form. _Everything_ you read in the code examples
is an idea in one way or another and you already familiarized yourself with
several one of these.

## List of Differences

Barry has a quirk, a tick, a bad habit. Barry compulsively turns Lists of one
single element into that single element. It's not that Barry has a problem with
single element Lists, it's that the two are _indistinguishable_ for Barry from
each other.

```
(6) = 6             >> evaluates to .
6 != (6)            >> to ()
("fish") = "fish"   >> to .
```

We call this the _single element rule_. You might feel some nostalgia for the
ability to distinguish a single element list from that single element, but it
might sweeten up your mood to know that you can append an idea to a single idea
and that becomes a list ot that two ideas. You can add ideas to nothing, or even
everything. Which is epic!

Somewhat similarly there's no such thing as an empty list. That's just Nothing.
This also explains why we write Nothing as ().

## The Truth About Barry

```
3 = 3   >> evaluates to . or all or true
```

Again, it only looks strange if Barry is not your first programming language. It
reads "three equals three" and that's our idea of Eq that evaluates to either .
or () . Usually Barry funks, but when the topic is equality he can get pretty
dramatic: it's All or Nothing question suddenly.

```
3 != 4   >> evaluates to . as != represents the Inequal idea
. = .    >> to . as everything is everything, as we all know from the song
() = ()  >> to . as nothing is nothing, there must be a song about this too
3 != ()  >> to . as 3 is something and that's not nothing
3 != .   >> to . as 3 is not everything
0 != ()  >> to . as 0 is not nothing, it's a number that happens to be 0
```

And so on. Barry is usually deeply liberal, but equality is an exception. Barry
is quite dramatic in this regard, as equality is an All or Nothing question for
him. Luckily for the rest of us here is the So operator represented as a ? in
the code.

```
?3       >> evaluates to . because 3 _is more like_ everything than nothing
?0       >> to () as the poor thing resembles to nothing more than everything
?(0 0)   >> to . as a list of two things involves the number of two and that's more like everything
```

Yep, I know, but at least Barry sees the world through this star shaped glass.

## The Hardest Thing in Programming

If naming is the hardest thing in programming (not counting cache invalidation
which doesn't sound too hard), then programming must be an easy endeavour.
Unfortunately naming involves the definition of boundaries around the things you
name. It's significantly easier to come up with name "seal" than to tell where
the concept of a seal starts and where it ends. You can stare into this abyss,
if you ask yourself the question if Barry is a seal or not.

Names are created by Labels.

```
x: 1         >> This is a labelled Num idea
x            >> evaluates to 1
1 y 3 y: 4   >> to 1 4 3 4
```

In Lists labels defined in the ancestor ideas are visible to references.

```
a: 3 (2+a (2*a a/2))   >> evaluates to 3 (5 (6 1.5))
```

The a label is visible and accessable from all descendant lists.

Now, what's interesting is that Barry doesn't produces errors when a name is not
resolvable from the point of reference. An unresolved name produces a Str but
it's a so called _unquoted_ string.

```
1 a 3 4   >> not an error, produces something like 1 "a" 3 4
```

Unquoted strings can be thought of like unresolved references, but the product
evaluates to an Str, hence the name. Actually unquoted strings are the same
mechanism that the parser uses itself to hoist references.

```
1 a 3 a: 4   >> evaluates to 1 4 3 4, despite the reference precedes the label
```

What happens is that, when the parser reaches a, it becomes an unquoted string
and as such it gets registered like a label with that name that doesn't point to
anything yet. When the parser reaches the label, the label registration process
can discover the already registered unquoted string and turn it into a label, so
that all earlier unquoted strings become proper references. This allows all
around hoisting, and the user can use names comfortable before declaring them
with labels.

```
x: 1
p: x y   >> this evaluates to 1 2, despite y is further down in the input
y: 2
```

## Stranger Strings

As we saw Barry in it's ethernal wisdom distinguishes quoted and unquoted
strings or Str's to be more pretentious. This behavior allows the user to use
names before writing boilerplate among other things, but also has some
consequences that she needs to be aware of.

```
"fish" = "fish"                 >> always evaluates to .
cod = "cod"                     >> **might** evaluate to . or not
fish: "Herring" fish = "fish"   >> evaluates certainly to "Herring" ()
```

Of course the fishy part is _might_, that's something of a red flag in the
context of programming language definitions. If a label named cod is not visible
from the point of reference cod will be just a string, and the expression will
evaluate to . . Otherwise it depends on what cod refers to.

The last example might seem a bit fishy, but that's just a List of a labelled
Str and a comparision operation between a Ref and the Str "fish". In this case
fish will evaluate to "Herring" which is most certainly not equal to "fish".
Now, we poured clear seawater into the glass.

The takeway is, that it's best to use quoted strings if you want to be sure to
produce a Str idea. Unquoted strings are useful if you want to refer to names
that you will _later_ define.

## Seals Are Funky!

As we all know, seals are magical creatures. Now to add just a touch of mystic
sheen to the syntax - that can appeal to the opposite sex if the oposite sex is
male - sometimes we use squiggles to name things. In reality these are seals.
For example the Add idea is represented as + in the code. Now that's a seal,
probably a very positive one. Seals increase the magical cuteness of the code,
making it more readable and shorter. 1 add 1 is absolutely readable but 1 + 1 is
shorter and strains the brain even less. You already encountered several seals
like : for Labels, the arithmetic operators + - / \*, >> for Natlang, etc.

The good news is that seals are mostly just _names_ of operators. OK, _some_
seals are different of course, behaving their own quirky ways, like Natlang for
example, as they serve a special purposes. Luckily there are only a few outliers
like that, and if Natlang didn't raised your eyebrows, I don't think the others
will.

## Walking the Lines

Except the last one, examples until now were interpreted as single line
expressions. It's entirely possible to write large programs of arbitrary
complexity as a single line in Barry, but some find this unconvenient, so Barry
patiently supports multiline programs as well.

```
a: 1
b: 3
a + b
```

What this three line input produces is indistinguishable from the one produced
by the following input.

```
a: 1 b: 3 a + b   >> same tree as the previous example
```

The two inputs differ only _laid out_ differently, their meaning is the same.
What you witnessing is the concept of _implicit lists_ that Barry uses to
eliminate the numbers of () pairs necessary to express meaningfully. In Barry
lists are just as central as in Lisp, but Barry likes the look of Python and
CoffeScript code better.

In Barry an input string is parsed into a _vertical implicit list_ and every
line has it's own _horizontal implicit list_. This means that until you don't
use indentation - what we will talk about later -, every line is added to the
input list, and the ideas on every line gets added to their own line lists.

```
1
2 3
4 5 6   >> same as 1 (2 3) (4 5 6)
```

What stops implicit lists from running away with unnecessary encapsulation is
the single element rule. The line of 1 was parsed into it's own implicit list
but then the encapsulation got removed, so we see it as a single element. With
sweet-sweet conventions we can use _lines_ in a file to our advantage to
eliminate the numbers of ()s needed to express the explicit nesting structure of
the code.

These sweet-sweet conventions manifest themselves in a set of somewhat intricate
rules that needs some bitter getting use to, but luckily they are also pretty
understandable and what's most important: they mostly produce naturally looking,
readable code.

You already learned three of these rules: the input has a vertical implicit
list; every line has a horizontal implicit list; labels in their own line point
to the following element in their vertical implicit list.

Now even these rules might need some getting use to. For example labels refer to
their next horizontal idea if there is one. So if you want to refer to a List
laid out horizontally, you need to encapsulate it.

```
l: (1 2 3)   >> l refers to the list
l': 4 5 6    >> l' refers to 4, not the list
```

## Breakdancing on Ice

We can use increased indentation to break long horizontal lines into vertical
multiline layouts. Increased indentation tells the parser that the user wants to
continue the previous _line_, but from now on in a _vertical_ implicit list.

```
1 2   >> horizontal layout 1 and 2 are parsed into the line's implicit list
  3   >> increased indentation, same implicit list with vertical layout from now
  4 5 >> vertical layout, line gets parsed into its own implicit list
```

The above example produces 1 2 3 (4 5) . The line with increased indentation
must follow the line it wants to continue immediately. An indented line with
_nothing to continue_ in the previous line is an error.

```
something: 12

  1   >> error, nothing to continue
  2
  3
```

When the parser reaches 1, it detects the increased indentation, but there's
nothing to continue in the previous line. But we can continue a line vertically
that's already started with a Label.

```
fish:
  "Kilgore Trout"
  "trout"
  1
```

If we break immediately after a label, the label will point to the list produced
by the vertical layout and _not_ the first element. This two is unfortunately
different.

```
a: 1 2 3
b:
  1 2 3
```

In the above example a refers to the first element of the list 1 and b refers to
the entire list. If we want to write the second example as a one-liner we need
to enclose explicitly: b: (1 2 3) .

A label that the parser that doesn't refer to anything is also produces an
error.

```
a:   >> error, as label is followed by an empty line, so nothing to name

```

## Only Love is Unconditional

Conditionals are just operators like any others. The if operator expects three
arguments, the first being the condition, then the idea to return in case the
condition evaluates to True and lastly the idea to return on False.

```
if 3 > 2 "Yay!" "Neh."   >> returns "Yay!"
```

Operators with _more than one_ right arguments and _no_ left argument are
_breakable_ into vertical layout if they are the first idea in a line. The if
operator only has three right argument so it's breakable. If we start a line
with it we can give the arguments in an indented vertical layout.

```
>> the same, just with a different layout
if 3 > 2
  "Yay!"
  "Neh."

>> also the same, we just broke the line earlier
if
  3 > 2
  "Yay!"
  "Neh."
```

Again, we're breaking the _line_ and not an idea, that's why we must _start_
with the operator that we're breaking. This looks very similar to breaking
lists, but lists can be extended indefinitely with new elements, while operators
usually can not. After the broken operator _completes_ by filling all the
argument slots, it will _reset the indentation level_.

```
if c=a
  1
  2
  3      >> increased indentation as parser resets after competion of if
  4
```

The above example is if c=a 1 2 (3 4) as 3 introduced a new vertical list, since
the indentation was reset to the level of the if.

```
if c=a
  1
  2
3
4
```

Here 3 4 continues the same list if started and produces if c=a 1 2 3 4.

## A Perfect Match for Barry

Match is also just an operator, what makes it interesting that it's a variadic
operator as it can consume as many arguments as the user feeds to it.

```
x: 3
match x
  1 "one"
  2 "two"
  3 "three"
  _ "Too much!"
```

The first argument of match is the idea to match and the following arguments are
any number of two element lists of an idea to match and the result idea. The
Blank idea can be used to declare the result if none of the cases matched.

Since it's a variadic operator the parser won't reset the indentation level
automatically.

## Coming Together with knitten

Because we love animals we call the idea to appending two lists Cat represented
as ~ in the code. Cat is one of the closest friend of Barry, so we refer to Cat
as knitten. Anyway, you can call appending to a list "catenation" or "knitting",
they mean the same.

```
(1 2) ~ (3 4)         >> evaluates to 1 2 3 4 as ~ knits the two lists together
"Hello " ~ "World!"   >> to "Hello World!", strings can be knitted too
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

## I Wants to Get Funked Up

It's no wonder, as "Funk is the absence of any and everything you can think of,
but the very essence of all that is", as Bootsy Collins nailed it so precisely.

Defining functions are the second most important abstraction vehicle after Lists
in Barry. With functions we can encapsulate intricate calculations into
comfortably reusable units.

```
f: x -> x * 2 + 1            >> a function definition
f 3                          >> a function call, evaluates to 7
f': a b -> a + b * 2         >> multiple function arguments
f' 1 2                       >> evaluates to 5
hw: -> "Hello " ~ "world!"   >> a really pure function with no argument, epic
```

With the Define idea which is represented by -> you can define a new operator.
If you hang a label to the operator definition, you can even use this operator
elsewhere in your source, which is also useful.

You might be a bit disappointed to hear about operators if you wished for pure
functions deep in your heart. Luckily operators _can_ be functions if they
happen to be pure as fresh arctic snow, at least in the sence, that they're
_deterministic_. It basically means that they are guaranteed to evaluate to the
same result given the same arguments.

Since all machine instruction changes the state of the underlying machine, even
the deeply admired nop instruction increments the program counter, Barry think
it's better to lift this somewhat unrealistic requirement of not having side
effects on functions. Now just as in case of pills, we still prefer functions
that _don't_ have side effects, or at least have as few as absolutely necessary.
Anyway Barry acknowledges that sometimes they will, and looks the other way.

Now, that both imperative imperials and somewhat functional rebels can lie back
comfortably, and call Barry a traitor, we can raise the question: what the hake
is an operator anyway? It's simple. An operator is a list that evaluates to its
last element instead of the entire list. Basically inside of an operator you can
use the operator's list as a playground and only return what you want from it,
after you fooled around.

```
f: ->
  "first"
  "second"
  "last"
f            >> evaluates to "last"
```

Now that's silly, you might think and you're absolutely right. Anyway we can try
to use Barry's sillyness to our advantage.

```
f: x ->
  y: 12
  x + y
f 3       >> evaluates to 15
```

In this case returning the last element makes more sense as otherwise the result
would be y: 12 15 . A list of a labelled constant _and_ the result. Now, nobody
wants to see those innards, are they? Anyway, you can approach the concept from
the angle of multiline codeblocks in other languages, which can help to turn
your head to the right direction, but it also becomes misleading soon as Barry
has no _real_ concept of lines. Only lists.

If you happen to be very clever, you might already suspect, that the the source,
the top level of the tree itself is an operator and evaluates to its last
element, and you would be spectacularly wrong. It's not. It's _just_ a list. If
you want the source to act like an operator you have to explicitly state it.

```
->
  a: 1
  a + 1

>> now . is an operator and . would evaluate to 2
```

A blank idea can be used to signify the location of the operator name in the
argument list and to define postfix and infix operators.

```
%: v _ p -> v * 100 / p
2000 % 50                 >> evaluates to 1000
```

Since most seals are just names, seals can be used to label new operator
definitions just like ordinary names.

Barry's a great fan of the modulo operator and sees the utility of percentages
as something fainter, but if the programmer decides to redefine % to her own
liking, he just looks the other way and thinks about something else. Names
propagate downstream so such a redeclaration is only visible to the descendants
of their context.

Not all operator ideas are nice enough to call them functions though. Some
operators are designed to evaluate to different values on different calls, like
random generators and time related operators for example. Some even change the
state outside of their own family.

## The Name of All Things Except Nothing

We said that references in embedded or _child_ lists can see the labels defined
in the outer or _parent_ list.

```
outer:
  a: 1
  b: 2
  inner:
    a + b   >> evaluates to 3
    b + c   >> to 5
  c: 3
```

This raises the question if we can do the opposite and reference things _from_
the outer list inside of an inner one? If naming is the act of organizing All
things into groups or sets and hanging Labels on these divisions, then it seems
logical to use All as an operator on names for this job. What else, really?

```
fish:
  name:  "Kilgore Trout"
  kind:  "trout"
  count: 1

fish.name   >> evaluates to "Kilgore Trout"
```

With the All operator we could reach a labelled idea inside an embedded List. If
we combine these two rules even ideas in sibling lists can be accessed easily.

```
p:
  x: 1
  y: 2

p`:
  x: p.y
  y: p.x

p`: evaluates to 2 1
```

Since _upstram_ labels are visible from _downstream_ ideas, p is visible from
p', and with the All operator can access names inside that list. If you squint
you can look at it as if the All operator would _make_ p the all for the next
name lookup. It might sound forced, but the concept of giving names and than
reffering to them and the concept of all the things is really very closely
related. At least in Barry's eyes.

There must be no whitespace between the all operator and the name, as with
whitespace after it, it's parsed as an All _value_ instead of an All _operator_.
Yes, the All idea is overloaded. There's an All value and an All operator.
Please don't tell anyone. Anyway, that's an exception and since All represents
_everything_ we could have botched it much more. Actually we did, but it's too
early to confess that yet.

## Magic Forestry

Forests are magical, trees are magical, seals are magical. Everything is
magical. Is Nothing magical? Is nothing something? Anyway, trees are especially
magical in the context of computing, because they grow _downwards_. Luckily this
doesn't seem to bother anyone.

Either it's because in western cultures we read left to right, top to botom, or
it's because of our endless sympathy for oppressive top down power structures,
this became the norm: trees just grow downwards in computers. Root is at the
_top_, leafs are at the bottom of these "trees", which are actually roots if we
want to be consequent. There must have been some _actual_ attempts to call them
roots, but that most probably made it kind of hard distinguish the root from its
root. So that's that. Once you see it, you can't unsee it.

Luckyily roots are trees topologically, so I guess everyone just looked the
other way. Including Barry. Barry says it's best to think about _these_ trees as
ones growing on the _inner_ surface of a hollow planet. Now, that's Barry. What
you should take away is that when we say _upstream_ we're talking about the
children to parent direction and when we say _downstream_, we're referring to
the parent to children direction.

## The Blissfull Ignorance of Operators

You might have realized that I tried to emphasize that the rule of upstream
labels being visible to downstream references only applies to Lists. Operator
definitions hide upstream labels except for operators defined upstream.

```
f: x -> x * 2
a: 1
f': y -> f y + 1   >> this is valid as f is visible from f'
f'': y -> y + a    >> this is invalid, as a is an unquoted Str
```

Evaluating f'' from the above example will produce an error as a will be an
unquoted string, that can not be added to anything. This rule intend to provide
a relatively clean namespace for operators to work in.

## It's a Family Matter

When it's absolutely necessary operators can access their parents' namespaces by
piling multiple All operators on top of each other, forming a so called
_relative_ reference.

```
a: 1

f: x -> x + ..a   >> relative reference
```

Now since parents and their children are considered relatives, we call this a
relative reference, and because All is everything and _the_ absolute truth at
the same time, we call references starting with a single . absolute references.

If you start a reference with a single . that name will be looked up in the
topmost idea of the tree.

```
x: 1
l:
  x: 2
  l':
    x: 3
    r: .x + 1   >> absolute reference
    r': x + 1

l.l'.r    >> evaluates to 2
l.l'.r'   >> evaluates to 4
```

Since we redefined x we _need_ to tell Barry that we are referring to x in the
root namespace and not the local one.

Barry stronly believes in the privacy of families, so it prefers this _relative_
naming over abolute ones even in lists. Absolute references are epic but also
fragile. Relative names _move with_ the parents if the parents are relocated on
the tree.

## The Tip of the Iceberg

To be entirely honest, that was just the tip of the difference iceberg. Barry
can look so alien because it is _used_ rather differently than other languages.
Other languages build a temporal abstract syntax tree during transforming the
input text into some executable target, but then, when they arrive to the
executable, they throw away this tree. Since Barry loves forestry, it doesn't
throw away the abstract syntax tree it produces. On the contrary: it looks at
the idea tree - as Barry likes to call it - as its main product and reuses it
for all kinds of purposes.

Barry breaks with the tradition of looking at the text files as the _source_. In
Barry the idea tree is the source, that we can _view_ in many different forms.
The most important form to view the tree in is the so called _standard notation_
and that's what you've been exposed to in all the prior code examples. In other
words Barry is a bidirectional language as it can produce the source of an AST
that produces the same AST when parsed back.

Barry alows the user to define _and_ manipulate trees of ideas that are in
reality are _just_ objects defined in the underlying implementation language.
Barry translates these trees back and forth from textual representation as the
embedding application requests.

## OCD for Lazy Persons

As Barry is liberal at heart, the parser accepts a lot of input that looks a bit
different from what Barry outputs as standard notation. Among other things, this
means that Barry is it's own formatter and normalizes input to standard notation
by architecture instead of tooling.

```
1+1                                 >> sn is 1 + 1
"Wily" >> Fish! >> "hake" "knitten"   >> sn is "Wily" >>Fish!>> "hake" knitten
```

Yes, even Natlang's get formatted in certain situations.

This architecture has the potential to bring **world peace** itself closer to
reality by rendering the tabs vs spaces kerfuffle moot, once and for all. At
least in the context of Barry.

## Mutators are Volatile

Not everybody likes mutants the same, but everyone has a place in Barry's huge
heart of warmth. Barry has no problems with mutants, and he quietly suspects,
that somewhere deep inside everybody might be a mutant somehow.

```
->
  x: 3     >> evaluates to 3, just a labelled Num
  x := 4   >> to 4, using a set operator idea on x
  x        >> to 4, operator returns 4
```

Set is a mutator idea as it _changes the idea tree_. In Barry, automatic
upstream name resolution stops at operator definitions, so you are only able to
mutate things inside of a function itself and downstream without using explicit
relative or absolute references.

Since most operators are meant to return, Barry is just to lazy or liberal to
care about what they are mutating inside themselves, until they behave
deterministic.

```
x: 3
m: y -> ..x := y   >> m is a new mutator operator
m 4                >> evaluates to 4
x                  >> to 4 as value has been mutated
```

Non-deterministic functions are usually also mutators in some sense as otherwise
they wouldn't be very useful. A random generator either needs to advance a seed
somewhere outside of the function or rely on something that is constantly
mutating anyway. Counters and clocks are very similar in this regard. What's
important is that mutators can be discovered by examining the tree without
ambiguity.

You might ask what happens if you evaluate this source again? The short answer
is it evaluates the same, because x: 3 also reevaluates during reevaluation.

After running the source Barry might show you the end state of the tree _after_
returning with all the effects and end results of mutations occured on the tree,
but it always _keeps_ the source's state _before_ evaluation. Because the source
is that: the state of the idea tree _before_ applying mutations it defines on
itself.

There are some fundamental mutators like rename and rip and you can write your
own ones to botch up the tree anyway you see fit. Basically Barry lets you edit
the source and bang it several times until it proves useful.

## A Single Source of Soot

If you're as unhinged as Barry is, you might even raise the question, what's the
difference between a change initiated by the user and a change initiated by the
tree on itself by a mutator? In a sense not much: the idea tree just changes for
whatever reason. On the other hand if the change is initiated by the tree
itself, it is deterministic, so we can reproduce any number of those changes
given an _initial state_ to start from.

The act of starting the idea tree to mutate is called _bang_, because "banging
the source" sounds much more appropriate and family friendly than "executing"
it. Running a tree was also a candidate but since neither trees nor seals have
legs we bang came out on top.

```
!bang .   >> start mutating the source
```

The ! before the operator tells Barry that this request is coming from the
_outside world_, in other words it's _not_ part of the source. Then what is it?

Now, the program you write can be as many nested layers of ideas as you see fit,
nevertheless the idea tree always roots from _one single idea_. And this root
idea kind of represents the entirety of the idea tree. For Barry it seemed that
the All idea is the prefect candidate for this job.

```
!rip .   >> Good bye!
```

In this example rip sends All to a one way trip somewhere. As it does with
everything you throw at it. In other systems it would be called something like
"deleting the source" or worse, but that's just rude. Barry also thinks that
it's kind of silly too, as he doesn't see how _ideas_ could be deleted at all.
How do you delete 3? Or +? Barry justs send them away with rip, when they're not
interesting enough to waste precious memory on them.

## It's Just a Matter of Time

To develop at least some sympathy towards Barry and it's also just a matter of
time _when_ mutators change the tree, or in other words in _what order_. Until
you use mutators the order of execution doesn't really matter, since references
work independently from the reffered labels definition order.

```
a: 1 b: 2 a + b   >> evaluates to 1 2 3
a + b a: 1 b: 2   >> also works evaluates to 3 1 2
```

On the other hand the execution order mutators can change the outcome of an
operator.

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
beings. It also happens to be one of, if not the single most important and
successful invention of all times. Time is an abstraction of change. The
discombobulation roots from the simple fact that time happens to only exist in
our imagination.

Time travel is _actually_ possible, in fact it's quiet easy, given you accept
the fact that it's only possible in your imagination, because time itself
happens to only exist there. In other words, what exists in a perceptible and
measurable fashion is _the moment of now_ and _change_. Change is a bit tricky
as we need memory to compare two moments, which is implemented in the reality
that's changing. Luckily Barry also happens to deal with imaginary abstractions,
so we don't have to deal with these disturbing details. Time travel is a breeze
with Barry.

## Keep it Simple Silly

Mutators are fun, mutators are necessary and mutators allows the programmer to
express algorithms orders of magnitudes _slower_ than their pure functional
counterparts, which usually also happen to read better and on the long run
easier to reason about.

Branches without mutators can be _simplified_ confidently, while parts with
moving part are just not. Basically parts targeted by mutators must be held
intact during evaluation.

```
1 + 2 * 3           >> no moving parts can confidentally simplified to 7
t: 1 + m: 2 * 3     >> must be kept intact as it's a target of a mutator
t.m := 3            >> now t evaluates to 10
```

These toy examples are just quick demonstrations of the underlying phenomenon,
they doesn't really show the possible implications this can have.

Luckily Barry is doing everything in it's power to help you bring your source to
the best shape you can. Simplifications done by other programming languages are
kept from the programmer most of the time. Barry can suggest and apply
simplifications on the idea tree as you edit it, and can show how a mutator
holds a section hostage, by marking locations targeted by mutators.

Often mutated parts can be kept isolated and as these parts are usually data
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
get recorded as time series data, for the exact reason: that they are
unreproducible by Barry.

This can happen during an ongoing bang. For example a game can record every
keyboard stroke and mouse input coming from the user and from that Barry can
reproduce the entire game run later since it's deterministic nature. Which is
neat.

Even more interestingly the _source_ itself is treated as a measurement: a
measurement of the quantum state of the programmer's brain, regarding the best
possible idea tree it can produce at the given moment. Because of this, changes
on the source code by the programmer get recorded in exactly the same
infrastructure.

And that's version control from Barry's viewpoint. Again, version control is not
implemented by tools, but by architecture.

## Fish Curry Funks Good

Now that was dense, so let's talk about the relaxing topic of operator currying
or incomplete operators as Barry calls them, to help resist the constant urge of
inappropriate kitchen jokes.

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

In this regard they're somewhat similar to operators.

A blank can be used to explicitly leave argument slots unfilled. This way you
can leave out arguments in the middle of the argument list.

```
clear: filter _ ?
clear (0 1 2 1 0)   >> will evaluate to 1 2 1
```

The \_ seal represents the idea of a blank. A blank is _not_ a null value of a
kind: it explicitly says that "this argument is unfilled". Incomplete operators
can come handy as lambda functions.

```
filter (1 2 3 4 5 6) %2   >> evaluates to (2 4 6)
```

In most regards incomplete operators can be used as any other idea.

```
ops: (+1) (-2) (*3) (/4)   >> a list of incomplete operators
map ops 5                  >> evaluates to 6 3 15 1.25
```

## To Infinity and Back

Computers are awesome. If you're dealing with trees. Otherwise not so much.
Let's suppose I decide to build an application that lets the user sculpt with
her computer. After some years of heroic effort, which if succeeds, most
probably involved trees to effectively store and process the clay particles
and/or voxels, I end up with a probably useful and marketable tool. And that's
tool is also most probably inferior to the real thing: a kilogram of good
quality sculpting clay. If you're not convinced think of sculpting as a domain
specific quantum programming language that runs on the most advanced specialized
quantum computer humanity could came up with during the milennias: clay.

On the other hand, if you want to deal with large amounts of information
organized into trees, then computers are absolutely awesome. Luckily dealing
with trees of information also happens to be the _easiest_ thing to do with
computers. Barry suspects that the two facts might be related: tools tend to be
good at things that are easy to do with them.

Dealing with trees is straightforward with computers, because code that
processes information can be organized similarly to what the tree describes.
When I want to output the standard notation of the idea tree I just need to
write the stdn method on every idea. A Num will output it's value, + a "+"
character and its left and right arguments. Ideas just need to call the stdn
method on their arguments or elements in case of lists and the _tree renders
itself_. I just need to care about rendering each idea, the tree itself emerges
from the links between the ideas.

It's called recursion: a function calling itself. Walking trees is just one
example of what you can do with recursion. Another useful construct one can
express with recursion is loops. A function calling itself is basically a loop.
If there is no stop condition it's an infinite loop, which is the basis of
application user interfaces and networking among other things.

You might be aware, that in some languages this would lead to an ever growing
stack with each cycle, which would cause infinite loops to eat up the computers
memory without any real benefit. The truth is that if a recursive function
returns the result of the recursion verbatim to the caller, then there's no need
for a new stack frame. Even Barry can recognize these circumstances and
recognize that there's no need to create a new stackframe with each call: the
last recursive call can pass back the result directly to the caller that
initiated the chain of recursion.

This technique is usually called _tail call optimization_ in other languages.
Since in Barry the last line of an operator is the return value this pattern is
easily recognizable in the stdn too.

```
count: i stop ->
  if i = stop
    i
    count i + 1 stop
```

This should be just as effective as a while or for loop in other comparable
languages.

## Cache is King

Now the easy part: cache invalidation. Imagine that you succeeded to build a
source that you like so much, that you want to bang it multiple times. You also
happen to work on one of two computationally expensive branches. You practically
don't touch one of the branches. You're probably the patient type if you reached
to this point, but evaluating one branch is already expensive in itself, so it
would be nice to _store_ the result of the unchanged branch instead of
calculating it.

When reading back a result from possibly persistent storage is faster than
calculating it constantly over and over, everybody thinks about caching and
sighs with sad resignation.

Barry's slow but mostly deterministic behavior guarantees that any result
arriving on the tree can be confidently cached. Cache invalidation propagates
upstream kind of obviously. One of Barry's favourite occupation is rebuilding
caches from other cached sub branches. What makes Barry scratch his head - which
is harder for seals than you think - is _what_ ideas to cache. Which locations
on the tree are the best candidates for caching?

Barry plays a little game in his head, to come up with acceptable answers to
this question. He assigns a _cost_ to ideas, because for an eternal being the
idea of _a_ cost is morbidly entertaining. So Barry immediately assigns _three_
costs to ideas, because that's even more entertaining. These are time, storage
and bandwith. From these associated costs and information about _currently_
available resources, Barry can figure out which ideas are the better candidates
for caching in the given circumstances.

Interestingly enough, from this perspective we can think about measurements as
ideas with _infinite cost_, because they just cannot be reproduced by any means.
Basically measurements are results that are _always_ cached and cannot be
invalidated by Barry: only the user can rip them.

## The Hyperdimensional Telescope

Until now we accessed elements by their name, but in computing it's also very
common and useful to access elements by their numerical index in the list they
are in. The At or @ idea allows accessing list elements procedurally, both
numerically and symbolically.

```
(1.1 2.2 3.3) @ 1   >> evaluates to 1.1
fishery:
  1 2 3
  4 5 6
  7 8 9
fishery @ (3 3)     >> evaluates to 9
```

Of course Barry starts indexing elements from 1. He _is_ slow. And a bit simple
too. Even he acknowledges that we loose a considerable amount of _identity_ as
programmers by this decision, but on the other hand with this convention the
index of the _first_ element is _one_, the second's is two and the 100th's 100.
Anyway, Barry is simpleton, so he quietly considers the ability to talk about
element positions and indexes without ambiguity a little win. An infinite number
of little wins, to be precise.

```
data:
  fish: "hake"
  fishy: "Kilgore Trout"

what: "fish"

data@1              >> evaluates to "hake"
data@(1 + 1)        >> to "Kilgore Trout"
data@what           >> to "hake"
data@(what ~ "y")   >> to "Kilgore Trout"
```

## Eating Banana in the Cryosphere

We can import names defined in other parts of the tree by the Import idea
designated by <- in the code.

```
myLib:
  myModule:
    f: -> "Super"
    f': -> "Duper"

<- myLib.myModule
myModule.f myModule.f'   >> evaluates to "Super" "Duper"
```

Import adds myModule to the name resolution process, somewhat similarly as if
the name would be defined where the import resides.

```
myLib:
  myModule:
    f: -> "Super"
    f': -> "Duper"

<- myLib.myModule..
f f'   >> evaluates to "Super" "Duper"
```

By _unrolling_ myModule with the .. operator _after_ the import name, we can
import all names defined in myModule with one go. But what's unrolling?

## Unrolling Sushi for Whatever Reason

The Unroll idea, represented as .. after something that evaluates to a list,
makes the elements look like if they would appear as individual elements in the
code.

```
L: 1 2 3
L': 0 L 4      >> evaluates to 0 (1 2 3) 4
L'': 0 L.. 4   >> to 0 1 2 3 4
```

This means that we can implement knitting by the following code.

```
~: a b -> a.. b..
```

With unrolling you can also pass lists as if they were operator arguments.

```
L: "Yes" "No"
if 3 > 4 L..    >> evaluates to "No"
```

## Units of Common Sense

The idea of the number is _so_ magnificent, that even its botched little cousin,
Num is quite amazing. Num can express cute tiny and huge epic numbers alike. You
can express the number of atoms in the universe and the distance between two
protons in a healthy nucleus with it. Or at least what you think these numbers
might be. At the same time numbers start to behave like an ant nest under the
supervision of over-curious nine year old boys, when they are dealing with real
world data. Whatever the hake the term "real world" means.

To avoid avoidable discombobulation Barry decided to look at quantities and
units through his star shaped pink eyeware, and treat them with the love they
deserve, to save precious hours of sleep time. Basically Barry thinks that
quantities and units are _good_ ideas.

```
<- sf.physics
t: 1s
l: 2m
sum: t + l   >> evaluates to 1s + 2m
```

Now that's unusual! What's going on? Again it's only weird if Barry is _not_
your first programming language. Those are units defined in the standard
fantasy, the closest thing Barry can think of a standard library. s and m are
ideas of physical units, second and meter to be specific. They're just operators
that accept a left argument (\_s) (\_m). Parsing the result of the last line
would produce the following idea tree:

```
1 2
| |
s m
|/
+
```

And that's exactly what you see there. As Barry can recognize that he can't
reduce an addition of a value of time to a value of length, the idea tree can't
be simplified further and gives back this idea as the result.

```
t: 3s
t + 2      >> evaluates to 3s + 2
t + 1min   >> to 63s
t * 3      >> to 9s
```

You can't add a number to a second meaningfully, as not having a unit means that
the number is _not_ a quantity: it's just a number. But you can most certainly
multiply a quantity with a number. A unit imply both the quantity the unit
expresses _and_ the conversion functions necessary to convert the underlying
number to the quantity's _base unit_. Units are treated as an interface layer,
the underlying representation is _always_ the same base unit.

Barry suspects that of units may have somehow more related to the concept
unification and less to the concept of confusion, but he is quiet about it to
avoid ridicule.

## What Type of Question is That!?

Everybody love types - including Barry -, as they seems to help us a great deal
to keep our sanity. It just happens that Barry likes ideas more, as he doesn't
care about sanity that much. To be honest, it's probably because he's just too
simple to comprehend the idea of sanity adequately.

Barry thinks that 1s describes what it attempts to describe fairly well: it's
parsable, it's displayable and it even seems to be flexible enough to swap s to
min if needed, since the underlying value is in the base unit of the quantity it
represents.

```
t:
  v: 90 u: s   >> evaluates to 90 s
t.u := min     >> mutates the tree
t              >> evaluates to 1.5 min
```

The idea of a second or minute can be expressed as an incomplete operator,
passed around like values. Instead of types Barry thinks about trees of ideas
representing a compound idea, like a quantity of time. But you can still
disassemble these compound ideas and assemble them to your heart's desires.

Even better they can naturally _grow_ to express more complex ideas.

```
date: 2025 years + 12 month
date s ago                 >> will show the seconds elapsed since date
```

date's value will change as the clock of the underlying computer will advance.
The underlying value never changes, ago is just an operator that outputs the
value relative to system's clock. In one hand it's just an interface thing, but
on the other hand it's the exact idea behind the concept of "ago".

What's great about this that ago can know about itself that it's _time
dependent_, so the user interface can register it as such, and update it
regularly as time progresses.

But what happens if you _input_ a value to Barry in that form? I'm glad I've
asked!

```
when: 10 years ago
when
```

When will reset on each bang to point to 10 years before the source was banged.
If your application has infinite loops ago will display different values, but
the underlying point in time is not changes. It still points to 10 years before
the bang.

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
that Barry is an software abstraction layer over the Naumannian computer
architecture that tries not to botch the original model's most valuable
property, that data and program are of the same nature. Just kidding! Barry is a
funky seal of course.

Barry is not a programming language. It's a proposal for a programming
environment where code and data is abstracted together with the same primitives
and even more importantly, where the abstract syntax tree is considered to be
the main product of programming. You can solve problems by simplifying this tree
and you can create application by running or banging this trees ad infinitum,
which is simplifying and complicating the tree recursively.

While it can feel alien - as Barry _is_ an alien technically -, but it is built
or dreamed up from off the shelf components, and widely adopted techniques.
Nothing exotic really.

## Not Working Slowly

Seals are pretty awkward on land, but they are pretty agile in water. Barry
abstracts the computer's linear memory away and present it in the form of an
arbitrary large labelled tree. Of course not Barry is the first programming
language that tries something similar, and common knowledge about these
experiments tells that these kinds of runtimes have an upper limit to their
performance. On the other hand these languages proved to be seemingly useful as
glue languages in high performance computing environments, but not on their own
rights, but mainly due to links to low level libraries.

Barry has a more direct approach to low level performance, as its meta-data
system allows the programmer to inform the system about possible hardware
related constraints of a list, for example the size of a list, or the allowed
ideas in it and their precision requirements. For example a user can tell about
a list that it's exactly 1000 elements of Nums with a 8 bit integer precision.
These constraints allow the runtime to store and process such a list with all
this information at hand, and map it optimally on the underlying hardware.

In Barry's eyes the labelled tree is an universal _interface_ capable to provide
unified access to all the useful data primitives like arrays, maps, structs,
enums and trees of course, but it doesn't mandate any particular underlying
implementation of these. It provides a generic variant of the List idea to
support arbitrary complexity trees, that is performant enough to work in the
scale of the 10s of thousands, to express programs and their object structures,
but also provides meta-data constraints to map computations in the billions to
hardware properly.

This way the user can manipulate the object structure of an application by the
full power of a generic programming language.

## Lore

### Barry, the Funky Seal

Now, enough of that nonsense! Let's talk about the fun stuff: Barry, our
extremely likeable namesake.

Barry, to be honest, a little bit on the slow side of things, but this is quiet
understandable as he lives on a planet, where seals just live forever. And ever.
While not being the sharpest knife in the drawer - some might say, he's more
like a spoon -, he sidesteps this limitation by a heart of warmth and limitless
love and patient curiosity towards everyone and everything around him.
Especially fish.

Barry likes to read a lot, mostly books that he came up with in his imagination.
But sometimes he reads books he finds lying around to spend time somes with
friends who signed up to one of Rip's travel agenciy's offerings.

### knitten

While Barry lives forever knitten dies and reborn one and half times per Planck
time, which is pretty fast. The infinite sadness over knitten's death and the
infinite joy over his best frind's rebirth kind of smooths out each other in
Barry's heart, so he got used to it Epochs ago.

knitten is officially the cutest white small fluffy arctic cat on the planet who
is the match maker there, a little cupid, who birngs lovers together in
sweet-sweet harmony. She also happens to be a bloody psychopath who tears these
lovers apart to recreate them as one in the match making process. Luckily she is
pretty quick so nobody feels a thing. Only Barry knows about this, but since it
doesn't bother anyone really, on the contraray coming together makes everybody
_more_ happy, he just looks the other way.

Sometimes knitten wears lipstick, at least that's what she says it is. Barry's
not so sure but loves knitten anyway.

### Victor the Lofty Worm

Victor is a quiet n-dimensional worm who can function as a hyperdimensional
telescope for Barry. He doesn't mind either if the friends throw him around
during board games of epic proportions as a dice as he is quet rectangular. At
least for a worm that is.

Victor likes sports in general, but simply manic about football. The only thing
he likes more is winning. He plays football alone, because that way he can
always win. It doesn't really bother anyone and everybody remembers when Victor
challenged the penguins for a match and forced everyone to try to beat them. Of
course the penguins won. knitten got a red card in the first nanosecond for
disintegrating a penguin. Victor was running around the pitch, shouting with
everybody all the time, shaming his friends and insulting the penguins. After
the match he melted and was blaming Barry for epochs for the outcome, who was
the goalie of course. Anyway, Barry likes waterpolo much better. In theory.

### Rip

The Reaper, or just Rip for his friends, wears a black hooded rope that shadows
it's face and walks with a scythe all the time, which is kind of strange. If it
even has a face, we don't know. Anyway, everybody avoids Rip for some reason.
Surprisingly Rip is kind of bubbly despite all the loneliness, probably for the
succsess of the travel agency it runs, that specializes on one way trips.

### Stella

Stella is all the starfish on the planet, and she is _beautiful_. She is the
most beautiful in starlight during the night. She reproduces by multiplication
so Stella _is_ all around and that makes the whole planet beautiful.

### Wily

Wily is an orca and he is a bike messenger. Since most orcas are named William,
one form or another, if you encounter a being named William, there's a very high
probability it's an orca. Anyway, Wily's thinking seems to revolve around the
concept of freedom: how important freedom is, how iportant the freedom of Wily
is and how proud Wili is of his freedom. At least he is so occupied with his own
freedom, that he doesn't bother trying to limit others'. It can get a bit
anoying anyway, because in Wily's interpretation freedom gives him the right to
change others. Now this can lead to friction if, as it happens, the party on the
other side of Wily's "freedom" doesn't want to change that much.

But Wily is good listener, you can share your heart's weights with him anytime,
if you don't mind the seemingly infinite monologe about how you should modify
your personality. Completely.

Barry sometimes comes up with imaginary hardships that he can share with Wily,
so he can listen to Wily's endless suggestions, advices and mandatory
recomendations, because the idea of changing his personality entertains him
infinitely. It just makes him giggle.

### mU

mU is a mostly white cow with large black spots. mU is _essentially_ Barry, just
happens to live on another planet. On that planet cows live casually forever. It
needless to say that mU is also pretty lazy. She's actually the same being, like
another cap of the same fungi living under the roots of the same forest.

### Welv

Welv is an arctic fox. If you ask her she will tell, she's interested in
metaphysics, but what she _really_ seems to be interested in is gossip. She
talks about others all the time, and to be honest not always the nicest things.
Luckliy everybody likes gossip just enogh to not being bothered.

### Shebang

Shebang is the entire universe in which Barry's planet located and happening in.
She is very nice and helps to everybody, until they behave like she wants them
to. Friction usually occurs when they're not. It's not that's she's angry or
something, it's more like she knows best how _she_ works. She constantly tries
to communicate, but everybody is living _inside_ her, and everybody is used to
communicate with beings _in_ their surrounding and not _with_ it, and it makes
this usually a bit difficult.

### Dyllberd

Dyllberd is the husbend of Shebang and they're inseparable. Now, while Shebang
is uncomprehensibly huge, Dyllberd is uncomprehensibly small. Whyle Shebang is
composed of everything - at least in _that_ universe -, everything is composed
of Dyllberd. Barry thinks he kind of understands this, or at least _feels_ it.
Dyllberd wears silly hats and _always_ in the process of walking out on a door,
which is kind of strange. This makes it a bit cumbersome to engage in longer or
deeper conversations with him.

### Nope

Nope always feels lonely and usually a bit moody too, constantly hanging his
nose, over the sadness of the eternal and unbreakable loneliness. Some even
suggest that he intentionally try to push this gloom over to others. What's for
sure, that when sombody is sad, Nope is so quick to show up, that it's hard to
decide which came first.

Anyway, Nope lives in between things: where there is Dyllberd ther's no Nope.
They appear always side by side, as they can not overlap. Theaw two old hoods
are spending a lot of time together talking about presumably interesting topics,
as Nope is the only one who can be at both side of the door on which Dyllberd is
stepping out.

Nope is a serious and dedicated hypochondriac, and probably not independently
from this, he is constantly on some self prescribed medications nobody else ever
heard of. The friends slowly adapted to his strange behavior, that they mainly
attribute to the side effects of the snake oils he consumes on a pretty regular
basis.

### Dagger

Dagger is Barry's husky, not that Barry has a proper understanding of the
concept of property. Barry interprets this one sided determination as a sign of
sympathy and likes Daggers company anyway. Dagger helps Barry a lot, as Barry
isn't very handy with his flippers and Dagger also has a overachiever mentality
anyway, that Barry lacks completely. Dagger is much more competent in practical
matters as he can run around and bark at least.

## Marketing Material

We only use effective and well targeted tag-lines for enhancing the public image
of Barry.

- Barry - A programming language to get lucky
- Barry - Haskell for dummies, by dummies
- Barry - The light at the end of an infinite tunnel
- Barry - The Esperanto of programming languages
- Barry - Proudly slow
- Barry - One of the fastest lanuage in no-operation benchmarks
- Barry - At least it's open source
- Barry - A language loved by inexperienced developers
- Barry - Only hated by haters
- Barry - A purely non-functional programming language at last
- Barry - A laguage that treats infinite loops as fist class citizens
- Barry - The functional pill, width side effects
- Barry - Highest rates of programming language per second
- Barry - It equally excells in everything
- Barry - The best toolset to write incomplete code
- Barry - A bicycle for your imagination
- Barry - A programming language for eternity
- Barry - An educational language for elderly programmers
- Barry - A high level language mostly inspired by assembly
- Barry - Time travel for the rest of us
- Barry - Leading the industry in entertainment value
- Barry - Makes your brain a quantum computer
- Barry - No errors, no error handling
