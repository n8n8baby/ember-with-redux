/* jshint expr:true */
import {
  describe,
  it,
  before,
  after
} from 'mocha';
import Ember from 'ember';
import { getNewMember } from 'ember-with-redux/utils/ds-storage';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

// 🌎 <- hey, it's a globe
describe('Acceptance: CreateRecord', function() {
  let application, container, store, redux, changeset;

  before(function(done) {
    application = startApp();
    visit('/');
    andThen(() => {
      container = application.__container__;
      redux = container.lookup('service:redux');
      store = container.lookup('service:store');
      changeset = store.checkoutChangeset({ modelName: 'dog', changes: { name: 'rover' }});
      done();
    });
  });

  after(function() {
    destroyApp(application);
  });

  it('should be a reasonable changeset', function() {
    const {modelName, ref} = changeset.get('meta');
    expect(modelName).to.equal('dog');
    expect(ref).to.be.ok;
  });

  describe('it should be able to persist a dog', function() {
    let model, dsState;
    before(function(done) {
      Ember.run(() => {
        store.persistChangeset(changeset).then(() => {
          dsState = redux.getState().ds;
            model = getNewMember(dsState, changeset);
            done();
        });
      });
    });
    it('should properly find the storage model' ,function() {
      expect(model).to.be.ok;
      expect(model).to.respondTo('get');
    });
    describe('meta 🌎', function() {
      let meta;
      before(function() {
        meta = model.get('meta');
      });
      it('should be ok', function() {
        expect(meta).to.be.ok;
      });
      it('should have the proper modelName', function() {
        expect(meta).to.have.property('modelName', 'dog');
      });
      it('should have proper id', function() {
        expect(meta).to.have.property('id');
      });
    });
    describe('data', function() {
      let data;
      before(function() {
        data = model.get('data');
      });
      it('should have the proper data', function() {
        expect(data).to.have.property('name', 'rover');
      });
    });
  });
});
