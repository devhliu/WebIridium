### organization

- Base CSS variables in `index.css`
- Specific stuff for themes in their own files (e.g. `dark.css`)
- `index.css` also contains some convenience variables derived from colors in individual theme files.
- Use CSS Modules (https://github.com/css-modules/css-modules)

### naming convention for variables

```css
--category-name-optionalModifier: ...;
```

example:

```css
--color-data-table-fg-dim: ...;
```

category: color

name: data table foreground

modifier: dim
