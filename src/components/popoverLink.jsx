import { Popover } from "react-tiny-popover"
import { useContext, useState } from "react"
import { renderMDX } from "../util/renderMDX"
import { Context } from "../Context"
import { Await } from "./Await"
import styles from "./popoverLink.module.css"

export const PopoverLink = ({ text, markdown }) => {
  const { data, resolveImport } = useContext(Context)
  const [isOpen, setIsOpen] = useState(false)

  const clickHandler = e => {
    e.preventDefault()
    setIsOpen(true)
  }

  return (
      <Popover
          isOpen={isOpen}
          positions={["top", "bottom", "right", "left"]}
          content={
            <div className={styles.popover}>
              <Await promise={renderMDX(markdown, data, resolveImport)} />
            </div>
          }
          onClickOutside={() => setIsOpen(false)}
          reposition={true}
      >
        <a href="#" onClick={clickHandler}>
          {text}
        </a>
      </Popover>
  )
}
