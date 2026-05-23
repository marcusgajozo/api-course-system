import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1779326053289 implements MigrationInterface {
  name = 'AutoMigration1779326053289';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."cursos_temas_enum" AS ENUM('Inovação', 'Tecnologia', 'Marketing', 'Empreendedorismo', 'Agro')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cursos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "titulo" character varying NOT NULL, "descricao" character varying NOT NULL, "temas" "public"."cursos_temas_enum" NOT NULL, CONSTRAINT "PK_391c5a635ef6b4bd0a46cb75653" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "cursos"`);
    await queryRunner.query(`DROP TYPE "public"."cursos_temas_enum"`);
  }
}
