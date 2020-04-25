import React, { Component } from 'react';

import randomgraph from 'randomgraph';

import {
  IDLE, FORWARDED, IGNORED,
  CONSCIOUS, SENSELESS,
  INITIAL, PLAYING, PAUSED,
  FPS,
} from './constants';

import Layout from './components/Layout';
import Graph from './components/Graph';
import Settings from './components/Settings';
import { weightedRandom, rangeBetween } from './utils';


function randomConsciousness(avarage) {
  const weight = weightedRandom([
    [avarage, CONSCIOUS],
    [1 - avarage, SENSELESS]
  ]);

  const [first, second] = [
    [0, 0.5],
    [0.5, 1],
  ][weight];
  
  return rangeBetween(first, second);
}

export default class App extends Component {
  constructor(props) {
    super(props);

    this.handleConsciousnessChange = this.handleConsciousnessChange.bind(this);
    this.handlePublish = this.handlePublish.bind(this);
    this.run = this.run.bind(this);
    this.handleReset = this.handleReset.bind(this);
    
    const graph = randomgraph.ErdosRenyi.np(270, 0.008);
    const avarageConsciousness = 0.2;

    this.state = {
      avarageConsciousness,
      simulationState: INITIAL,
      nodes: graph.nodes.map(({ label }) => ({
        id: label,
        state: IDLE,
        size: graph.edges.filter(
          ({ source, target }) => (
            graph.nodes[source].label === label ||
            graph.nodes[target].label === label
          )
        ).length,
        consciousness: randomConsciousness(avarageConsciousness),
      })),
      edges: graph.edges.map(({ source, target }) => ({
        source: graph.nodes[source].label,
        target: graph.nodes[target].label,
      })),
    };
  }

  handleConsciousnessChange(value) {
    const consciousness = parseFloat(value);
    this.setState({
      avarageConsciousness: value,
      nodes: this.state.nodes.map(
        node => ({
          ...node,
          consciousness: randomConsciousness(consciousness)
        })
      )
    });
  }

  getNodeById(nodeId) {
    const [node] = this.state.nodes.filter(
      ({ id }) => id === nodeId
    );

    return node;
  }

  run() {
    const { nodes, edges } = this.state;

    const forwardedIds = nodes.filter(
      ({ state }) => state === FORWARDED,
    ).map(
      ({ id }) => id
    );

    const outbound = edges.filter(
      ({ source }) => forwardedIds.indexOf(source.id) > -1
    ).map(
      ({ target }) => target.id
    );

    const inbound = edges.filter(
      ({ target }) => forwardedIds.indexOf(target.id) > -1
    ).map(
      ({ source }) => source.id
    );

    const undirected = outbound.concat(
      inbound
    ).filter(
      nodeId => this.getNodeById(nodeId).state === IDLE
    );

    const updates = {};

    this.setState({
      nodes: nodes.map(
        node => undirected.indexOf(node.id) > -1 ? ({
          ...node,
          state: weightedRandom([
            [node.consciousness, IGNORED],
            [1. - node.consciousness, FORWARDED],
          ]),
        }) : node
      ),
    })

    if (undirected.length) {
      this.timeout = setTimeout(this.run, FPS)
    };
  }

  handlePublish(nodeId) {
    return () => {
      const { nodes } = this.state;
      this.setState({
        simulationState: PLAYING,
        nodes: nodes.map(
          node => node.id === nodeId ? {
            ...node,
            state: FORWARDED,
          } : node
        ),
      }, () => {
        setTimeout(this.run, FPS);
      });
    }
  }

  handleReset() {
    this.setState({
      simulationState: INITIAL,
      nodes: this.state.nodes.map(
        node => ({
          ...node,
          state: IDLE,
        })
      )
    });

    clearTimeout(this.timeout);
  }

  render() {
    const {
      nodes, edges, avarageConsciousness, simulationState
    } = this.state;
    return (
      <Layout>
        <Graph
          nodes={ nodes }
          edges={ edges }
          height={ 600 }
          onPublish={ this.handlePublish }
        />
        <Settings
          avarageConsciousness={ avarageConsciousness }
          onChangeConsciousness={ this.handleConsciousnessChange }
          nodes={ nodes }
          simulationState={ simulationState }
          onReset={ this.handleReset }
        />
      </Layout>
    );
  }
}
