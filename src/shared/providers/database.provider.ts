import dataSource from '@shared/config/data-source.config'

class DatabaseProvider {
  public async initialize() {
    await dataSource.initialize()
  }
}

export const databaseProvider = new DatabaseProvider()
