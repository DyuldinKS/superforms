import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardHeader,
  CardBody,
} from 'reactstrap';
import { BaseComponent, ErrorPanel } from '../shared/components';
import { connectNewOrg } from '../shared/components/connect';
import Breadcrumb from '../shared/components/Breadcrumb';

const propTypes = {
  // from Redux
  parentId: PropTypes.number.isRequired,
  parentOrgName: PropTypes.string.isRequired,
  createOrg: PropTypes.func.isRequired,
};

const defaultProps = {};

class CreateOrgRoute extends BaseComponent {
  constructor(props) {
    super(props);

    this.requiredFields = ['fullName', 'label', 'email'];

    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(values) {
    const response = await this.props.createOrg(values);
    return response;
  }

  render() {
    const { parentId, parentOrgName } = this.props;
    const { error, uploading } = this.state;

    return (
      <React.Fragment>
        <Breadcrumb id={parentId} lastLabel="Новая организация" />
        <div className="container app-creation">
          <h1>Новая организация</h1>

          <Form onSubmit={this.handleSubmit} className="app-creation-form">
            <Card className="app-creation-form-entity">
              <CardHeader>
                Информация об организации
              </CardHeader>
              <CardBody>
                <FormGroup>
                  <Label for="fullName">Полное наименование</Label>
                  <Input
                    name="fullName"
                    type="textarea"
                    value={this.getValue('fullName')}
                    onChange={this.handleInputChange}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="label">Краткое наименование</Label>
                  <Input
                    name="label"
                    value={this.getValue('label')}
                    onChange={this.handleInputChange}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="email">Электронная почта</Label>
                  <Input
                    name="email"
                    value={this.getValue('email')}
                    onChange={this.handleInputChange}
                  />
                </FormGroup>
              </CardBody>
            </Card>

            <Card className="app-creation-form-location">
              <CardHeader>
                Принадлежность к организации
              </CardHeader>
              <CardBody>
                <FormGroup>
                  <Label for="org">Организация</Label>
                  <Input
                    name="org"
                    disabled
                    value={parentOrgName}
                  />
                </FormGroup>

                <FormGroup className="app-creation-form-submit-outer">
                  {
                    error
                      ? <ErrorPanel message={error} />
                      : null
                  }
                  <Button type="submit" color="primary">
                    {
                      uploading
                        ? 'Добавление'
                        : 'Добавить'
                    }
                  </Button>
                </FormGroup>
              </CardBody>
            </Card>
          </Form>
        </div>
      </React.Fragment>
    );
  }
}

CreateOrgRoute.propTypes = propTypes;
CreateOrgRoute.defaultProps = defaultProps;

export default connectNewOrg(CreateOrgRoute);
