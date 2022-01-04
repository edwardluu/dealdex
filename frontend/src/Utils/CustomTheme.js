// importing the required chakra libraries
import { theme as chakraTheme } from '@chakra-ui/react'
import { extendTheme } from "@chakra-ui/react"

// declare a variable for fonts and set our fonts. I am using Inter with various backups but you can use `Times New Roman`. Note we can set different fonts for the body and heading.

// declare a variable for our theme and pass our overrides in the e`xtendTheme` method from chakra
const customTheme = extendTheme({
  fonts: {
    ...chakraTheme.fonts,
    body: "Inter",
    heading: "Inter"
  }
})

// export our theme
export default customTheme