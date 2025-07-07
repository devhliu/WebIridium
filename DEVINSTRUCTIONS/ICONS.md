# getting icons

1.  Get icons from this website: https://icon-sets.iconify.design/fluent/.
    Prefer fluent ui system icons, but if a good icon is not available, try looking at other sets.
2.  When you pick an icon, click it, make sure the color is "currentColor" so it inherits the color of whatever you put it in.
3.  Copy and paste the SVG it into a file (inside `/src/assets/icons`).

# using icons

1.  Import the icons via `@/assets/icons/ICON_NAME.svg?react`
    - make sure to include the `?react` at the end
2.  This will import the SVG as a React component
    - (we use `svgr` which preprocesses the SVGs into a React component at build time)
3.  (optional) set `width="1em" height="1em"` to make the icon the same size as the text
