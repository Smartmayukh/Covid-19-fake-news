import React, { Component } from 'react';
import classNames from 'classnames';

import styles from './Graph.module.css';
import { padding, shade } from '../utils';
import { FORWARDED, IDLE, IGNORED } from '../constants';

export default function Node({
  layout, node, current, width, height,
  onSetCurrent, onPublish,
}) {
  const position = layout[node.id];
  const transform = `translate(
    ${padding(position.x, width, 7)},
    ${padding(position.y, height, 30)}
  )`;

  const classes = classNames({
    [styles.node]: true,
    [styles.forwarded]: node.state === FORWARDED,
    [styles.ignored]: node.state === IGNORED
  });

  return (
    <g key={ `${node.id}-Node` } transform={ transform }>
      <circle
        className={ classes }
        r={ (current === node.id ? 12 : 6) + node.size }
        stroke={ 2 }
        onMouseOver={ onSetCurrent(node.id) }
        onMouseOut={ onSetCurrent(null) }
        onClick={ onPublish(node.id) }
        fill={ shade(node.consciousness) }
      />
    </g>
  );
}
