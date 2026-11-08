import type { StructureBuilder } from 'sanity/structure';

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('The Health Issue')
    .items([
      S.listItem()
        .title('📄 Artikelen')
        .child(
          S.list()
            .title('Artikelen')
            .items([
              S.listItem().title('Alle artikelen').child(
                S.documentList().title('Alle artikelen').filter('_type == "post"')
              ),
              S.listItem().title('⚖️ Vergelijkingen').child(
                S.documentList().title('Vergelijkingen').filter('_type == "post" && template == "comparison"')
              ),
              S.listItem().title('🔬 Honest Reviews').child(
                S.documentList().title('Honest Reviews').filter('_type == "post" && template == "honest-review"')
              ),
              S.listItem().title('📝 Informatieve blogs').child(
                S.documentList().title('Informatieve blogs').filter('_type == "post" && template == "standard"')
              ),
            ])
        ),
      S.divider(),
      S.listItem().title('🗂️ Categorieën').child(
        S.documentList().title('Categorieën').filter('_type == "category"')
      ),
      S.listItem().title('👤 Auteurs').child(
        S.documentList().title('Auteurs').filter('_type == "author"')
      ),
    ]);
