require 'rails_helper'

RSpec.describe Wellplate, type: :model do
  let!(:collection) { create(:collection) }
  let!(:screen)     { create(:screen, collections: [collection]) }
  let!(:wellplate)  {
    create(:wellplate, collections: [collection], screens: [screen])
  }
  let!(:sample)     { create(:sample, collections: [collection]) }
  let!(:well)       {
    create(:well, sample_id: sample.id, wellplate_id: wellplate.id)
  }

  describe 'creation' do
    it 'is possible to create a valid screen' do
      expect(wellplate.valid?).to be(true)
    end
  end

  describe 'after creation' do
    it 'has associations' do
      expect(
        CollectionsWellplate.find_by(wellplate_id: wellplate.id)
      ).to_not be_nil
      expect(wellplate.wells.pluck(:id)).to include(well.id)
      expect(wellplate.samples.pluck(:id)).to include(sample.id)
      expect(
        collection.collections_wellplates.find_by(wellplate_id: wellplate.id)
      ).to_not be_nil
    end

    it 'has a CodeLog' do
      expect(wellplate.code_log.value).to match(/\d{40}/)
      expect(wellplate.code_log.id).to match(
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
      )
    end
  end

  describe 'deletion' do
    before { wellplate.destroy! }

    it 'destroys associations properly' do
      expect(
        CollectionsWellplate.find_by(wellplate_id: wellplate.id)
      ).to be_nil
      expect(Well.find_by(id: well.id)).to be_nil
      # TOCHECK should samples be deleted?
      # expect(Sample.find_by(id: sample.id)).to be_nil
      expect(
        collection.collections_wellplates.find_by(wellplate_id: wellplate.id)
      ).to be_nil
      expect(wellplate.screens).to eq [screen]
      expect(wellplate.screens_wellplates).to be_empty
    end

    it 'only soft deletes wellplate and associated sample' do
      expect(wellplate.deleted_at).to_not be_nil
      expect(wellplate.wells.only_deleted.find_by(id: well.id)).to_not be_nil
      # TOCHECK should samples be deleted?
      # expect(
      #   wellplate.samples.only_deleted.find_by(id: sample.id)
      # ).to_not be_nil
      expect(
        CollectionsWellplate.only_deleted.find_by(wellplate_id: wellplate.id)
      ).to_not be_nil
      expect(
        ScreensWellplate.only_deleted.find_by(
          screen_id: screen.id, wellplate_id: wellplate.id
        )
      ).to_not be_nil
      expect(wellplate.screens_wellplates.only_deleted).to_not be_empty
    end
  end
end
