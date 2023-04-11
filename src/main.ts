import { appProvider, databaseProvider } from '@shared/providers'

appProvider.listen()

databaseProvider.initialize()
