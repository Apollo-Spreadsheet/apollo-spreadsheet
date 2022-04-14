import { FormControl, InputLabel, MenuItem, Select, Theme } from '@mui/material'
import React, { memo, useCallback, useState } from 'react'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}))

interface Props {
  activeThemeIndex: number
  handleChange: (index: number) => void
}
export const ThemeSelectMenu: React.FC<Props> = memo(({ activeThemeIndex, handleChange }) => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])

  const onSelectChange = useCallback(
    event => {
      handleChange(Number(event.target.value))
    },
    [handleChange],
  )

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="demo-controlled-open-select-label">Select Theme</InputLabel>
      <Select
        labelId="demo-controlled-open-select-label"
        id="demo-controlled-open-select"
        open={open}
        variant={'standard'}
        disableUnderline
        onClose={handleClose}
        onOpen={handleOpen}
        value={activeThemeIndex}
        onChange={onSelectChange}
      >
        <MenuItem value={0}>Dark Mode</MenuItem>
        <MenuItem value={1}>Light Mode</MenuItem>
        <MenuItem value={2}>Colored</MenuItem>
        <MenuItem value={3}>Empty/No Theme</MenuItem>
      </Select>
    </FormControl>
  )
})
