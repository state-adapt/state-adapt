## Agents

Every StateAdapt package ships an agent skill containing its full API
reference:

```sh
npx skills add ./node_modules/@state-adapt/core --skill state-adapt-core
npx skills add ./node_modules/@state-adapt/rxjs --skill state-adapt-rxjs
# etc
```

### Or skip the skills

[This article](https://medium.com/google-cloud/skills-sprawl-when-too-much-of-a-good-thing-bloats-your-ai-agent-167f907e9dc2)
explains how every skill's name and description sit in the agent's
context on every request, and the more skills you install, the more confused agents can get.

The references ship inside the packages either way, so an alternative is to create a
`dev.md` file and point agents to it for development tasks.
In this file you can describe code conventions and useful references:

```
<!-- dev.md -->
Always prefer declarative code and avoid imperative code.

API references for @state-adapt packages are in
node_modules/@state-adapt/*/skills/*/references
```
