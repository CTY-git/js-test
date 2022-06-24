import React, { useMemo, useCallback, useRef, useState } from "react"
import { AST } from "@/parser"
import {
  GRAPH_NODE_MARGIN_VERTICAL,
  GRAPH_CHOICE_PADDING_HORIZONTAL,
  GRAPH_CHOICE_PADDING_VERTICAL,
} from "@/constants"
import Nodes from "./nodes"
import StartConnect from "./start-connect"
import EndConnect from "./end-connect"
import Content from "./content"
type Props = {
  index: number
  x: number
  y: number
  node: AST.ChoiceNode
  selected: boolean
  onLayout: (index: number, layout: [number, number]) => void
}

const ChoiceNode = React.memo(
  ({ index, x, y, selected, node, onLayout }: Props) => {
    const { id, branches } = node
    const unLayoutedCount = useRef(0)
    const [layout, setLayout] = useState<[number, number]>([0, 0])
    const layouts = useRef<[number, number][]>([])

    const rects = useMemo(() => {
      let curY = y + GRAPH_CHOICE_PADDING_VERTICAL
      return new Array(branches.length).fill(0).map((_, index) => {
        if (!layouts.current[index]) {
          return { x: 0, y: 0, width: 0, height: 0 }
        }
        const [width, height] = layouts.current[index]
        const nodeX = x + (layout[0] - width) / 2
        const nodeY = curY
        curY += height + GRAPH_NODE_MARGIN_VERTICAL
        return { width, height, x: nodeX, y: nodeY }
      })
    }, [branches, x, y, layout])

    const handleNodeLayout = useCallback(
      (branchIndex: number, branchLayout: [number, number]) => {
        layouts.current[branchIndex] = branchLayout
        unLayoutedCount.current++
        if (unLayoutedCount.current % branches.length === 0) {
          const [width, height] = layouts.current.reduce(
            ([width, height], [nodesWidth, nodesHeight]) => [
              Math.max(width, nodesWidth + 2 * GRAPH_CHOICE_PADDING_HORIZONTAL),
              height + nodesHeight,
            ],
            [
              0,
              (layouts.current.length - 1) * GRAPH_NODE_MARGIN_VERTICAL +
                GRAPH_CHOICE_PADDING_VERTICAL * 2,
            ]
          )
          onLayout(index, [width, height])
          setLayout([width, height])
          unLayoutedCount.current = branches.length
        }
      },
      [index, branches.length, onLayout]
    )
    return (
      <Content
        selected={selected}
        id={node.id}
        className="transparent-fill"
        x={x}
        y={y}
        width={layout[0]}
        height={layout[1]}
      >
        {branches.map((branch, index) => {
          const {
            x: nodeX,
            y: nodeY,
            width: nodeWidth,
            height: nodeHeight,
          } = rects[index]
          return (
            <React.Fragment key={index}>
              <StartConnect
                start={[x, y + layout[1] / 2]}
                end={[nodeX, nodeY + nodeHeight / 2]}
              />
              <Nodes
                id={id}
                key={index}
                index={index}
                x={nodeX}
                y={nodeY}
                nodes={branch}
                onLayout={handleNodeLayout}
              />
              <EndConnect
                start={[nodeX + nodeWidth, nodeY + nodeHeight / 2]}
                end={[x + layout[0], y + layout[1] / 2]}
              />
            </React.Fragment>
          )
        })}
      </Content>
    )
  }
)
ChoiceNode.displayName = "ChoiceName"
export default ChoiceNode