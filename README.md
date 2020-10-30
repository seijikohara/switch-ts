# switch-ts
Switch-case with support for complex conditions for TypeScript

## Exapmle

```typescript
import { when } from "switch-ts";

const result = when(1)
  .on(v => v === 1, () => "value1")
  .on(v => v === 2, () => "value2")
  .on(v => v === 3, () => "value3")
  .otherwise(() => "other value");
// result -> "value1"
```

- A comparison function is also provided.
  - `eq`, `ne`, `gt`, `lt`, `ge`, `le`

```typescript
import { eq, when } from "switch-ts";

const result = when(1)
  .on(eq(1), () => "value1")
  .on(eq(2), () => "value2")
  .on(eq(3), () => "value3")
  .otherwise(() => "other value");
// result -> "value1"
```
