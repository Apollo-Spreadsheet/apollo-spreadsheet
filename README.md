# Apollo Spreadsheet

## Installation

`npm i apollo-spreadsheet`
OR
`yarn add apollo-spreadsheet`

[Apollo in NPM](https://www.npmjs.com/package/apollo-spreadsheet)

## Motivation

I have been dealing with large data sets views in the past two years, the most common "need" was a tabular plugin that offer a mix of excel and table.
There are no plugin that solves the exactly same problem that ApolloSS solves, especially for free
Most of the "paid" plugins are created with vanilla Javascript to be framework-agnostic but when they are imported for React they are usually wrapped in a component that deals with a lot of updates outside virtual-dom and that was the main issue on the previous plugins i have been using (ApolloSS is controlled via virtual-dom and offers a way to control all the features with react lifecycles)

## Why?

Apollo does not mutate date, relies on React updates, its built using Typescript, developer friendly, offers merge cells, immutability support, many other common grid features and virtualizes the data at all cost avoiding unnecessary elements in the DOM

## Quick Features

- Lightweight
- Supports styled-components (brings Material-UI by default)
- Sorting
- Travel like Excel navigation
- Row Selection
- Row Grouping
- Row and Column spanning aka Merge Cells
- Virtualizable (uses react-virtualized under the hood)
- Resizable (offers fixed and dynamic container width and height support)
- Immutable (the data is 100% controlled outside and simply displays that data without modifying it)
- Editing (comes with a Text, Numeric and Calendar editor but allows you to create your own editor)
- Exports (supports CSV, Excel and JSON)
- Custom renderer support (allows the developer to provide his own cell/header renderer)
- Developer friendly API

## Documentation

https://apollo-docs.famousgadget.pt

## Storybook

https://apollo-storybook.famousgadget.pt
