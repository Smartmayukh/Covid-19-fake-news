import React, { Component } from 'react';

import {
  forceSimulation, forceLink, forceManyBody, forceCenter,
  forceCollide,
} from 'd3-force';
import classNames from 'classnames';

import styles from './Graph.module.css';
import Edge from './Edge';
import Node from './Node';
import { shade } from '../utils';
import { FORWARDED, IDLE, IGNORED } from '../constants';

export default class Graph extends Component {
  constructor(props) {
    super(props);

    this.handleTick = this.handleTick.bind(this);
    this.setCurrent = this.setCurrent.bind(this);

    this.state = {
      current: null,
      layout: props.nodes.reduce(
        (prev, acc) => (
          prev[acc.id] = {
            x: 0,
            y: 0,
          }, prev
        ),
        {}
      ),
    };
  }

  componentDidMount() {
    
  }

  componentWillMount() {
    const { width, height, nodes, edges } = this.props;

    const simulation = this.simulation = (
      forceSimulation(nodes)
        .force('link', forceLink().id(node => node.id))
        .force('charge', forceManyBody())
        .force('collide', forceCollide(() => 10).iterations(2))
        .force('center', forceCenter(width / 2, height / 2))
    );

    (
      simulation
        .force('link')
        .links(edges)
    );

    simulation.on('tick', this.handleTick);
  }

  componentWillUnmount() {
    this.simulation.off('tick', this.handleTick);
  }

  handleTick() {
    const { simulation } = this;
    const { layout } = this.state;
    let updates = {};

    simulation.nodes().map(
      node => {
        updates[node.id] = node;
      }
    );

    this.setState({
      layout: {
        ...layout,
        ...updates,
      }
    });
  }

  setCurrent(nodeId) {
    return () => {
      this.setState({
        current: nodeId,
      });
    };
  }

  render() {
    const { nodes, edges, width, height, onPublish } = this.props;
    const { layout, current } = this.state;

    return (
      <svg width={ width } height={ height } style={{
        shapeRendering: 'geometricPrecision',
      }}>
        { edges.map((edge, index) => 
          <Edge
            key={ index }
            current={ current }
            width={ width }
            height={ height }
            nodes={ nodes }
            { ...edge }
          />
        ) }

        <g>
          { edges.map((edge, index) => 
            <Edge
              key={ index }
              current={ current }
              width={ width }
              height={ height }
              nodes={ nodes }
              onlyCurrent={ true }
              { ...edge }
            />
          ) }
        </g>

        { nodes.map((node, index) => 
          <Node
            key={ index }
            node={ node }
            layout={ layout }
            current={ current }
            width={ width }
            height={ height }
            onPublish={ onPublish }
            onSetCurrent={ this.setCurrent }
            { ...node }
          />
        ) }
      </svg>
    );
  }
}

Graph.defaultProps = {
  width: 900,
  height: 600,
  nodes: [],
  edges: [],
};
