# switch-ts
Switch-case with support for complex conditions for TypeScript

## Exapmle

```typescript
import { when } from "switch-ts";

const result = when(1)
  .is(v => v === 1, () => "value1")
  .is(v => v === 2, () => "value2")
  .is(v => v === 3, () => "value3")
  .default(() => "default value");
// result -> "value1"
```

- A comparison function is also provided.
  - `eq`, `ne`, `gt`, `lt`, `ge`, `le`

```typescript
import { eq, when } from "switch-ts";

const result = when(1)
  .is(eq(1), () => "value1")
  .is(eq(2), () => "value2")
  .is(eq(3), () => "value3")
  .default(() => "default value");
// result -> "value1"
```
