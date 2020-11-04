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

- Helper functions is also provided.
  - `then`, `eq`, `ne`, `gt`, `lt`, `ge`, `le`

```typescript
import { eq, then, when } from "switch-ts";

const result = when(1)
  .is(eq(1), then("value1"))
  .is(eq(2), then("value2"))
  .is(eq(3), then("value3"))
  .default(then("default value"));
// result -> "value1"
```
