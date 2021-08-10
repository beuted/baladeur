import React, { useEffect, useState, useRef } from 'react';
import './ArrowOverlay.css';
import arrow from './Back_Arrow.svg';

// Adding 0 because the arrow of the SVG is pointing left when it should be pointing left ?? completly random guess here
export default function ArrowOverlay(props) {
  return (<div className="arrow-overlay">
    <div className="arrow" style={{ transform: `rotate(${(props.orientation + props.orientationToFollow)}deg)` }}>
      <img src={arrow} className="arrow-img" />
    </div>
  </div>);
}