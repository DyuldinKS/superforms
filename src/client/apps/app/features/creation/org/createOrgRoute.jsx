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

const propTypes = {
  // from Redux
  chiefOrgName: PropTypes.string.isRequired,
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
    const { chiefOrgName } = this.props;
    const { error, uploading } = this.state;

    return (
      <div className="container app-creation">
        <h1>Новый пользователь</h1>

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
                  value={chiefOrgName}
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
    );
  }
}

CreateOrgRoute.propTypes = propTypes;
CreateOrgRoute.defaultProps = defaultProps;

export default connectNewOrg(CreateOrgRoute);
