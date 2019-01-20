import React from 'react';
import Tooltip from 'rc-tooltip';

export default function (props) {
  const overlay = (
     <div style={{maxWidth: '200px', fontSize: '120%'}}>
        {props.content}
     </div>
  );
  return (
    <Tooltip animation="zoom" trigger="hover click" overlay={overlay}>
      {props.children || <i className='fa fa-question-circle'/>}
    </Tooltip>
  );
}
