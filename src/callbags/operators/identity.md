# Identity

Here is some boilerplate you can use to create an operator

```typescript
import { AnyPullPush, Source } from '../sources'

export function _identity<Value, Index, Err, R, P extends AnyPullPush>() {
	return function (
		source: Source<Value, Index, Err, R, P>,
	): Source<Value, Index, Err, R, P> {
		return function (props) {
			return source(props)
		}
	}
}
```
