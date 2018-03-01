import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse } from 'reactstrap';

const propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.element
};

const defaultProps = {
  children: null,
};

class AccordionItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false,
    }

    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  handleButtonClick() {
    this.setState(state => ({
      expanded: !state.expanded,
    }));
  }

  render() {
    const { children, label } = this.props;
    const { expanded } = this.state;

    return (
      <div className={`accordion-item ${expanded ? 'expanded' : null}`}>
        <Button
          className="accordion-item-button"
          color="link"
          onClick={this.handleButtonClick}
        >
          {label}
        </Button>
        <Collapse
          isOpen={expanded}
          className="accordion-item-content"
        >
          {children}
        </Collapse>
      </div>
    );
  }
}

AccordionItem.propTypes = propTypes;
AccordionItem.defaultProps = defaultProps;

export default AccordionItem;
