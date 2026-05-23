import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1779549157032 implements MigrationInterface {
  name = 'AutoMigration1779549157032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."turmas_status_enum" RENAME TO "turmas_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."turmas_status_enum" AS ENUM('DISPONIVEL', 'ENCERRADO')`,
    );
    await queryRunner.query(
      `ALTER TABLE "turmas" ALTER COLUMN "status" TYPE "public"."turmas_status_enum" USING CASE "status"::"text" WHEN 'disponível' THEN 'DISPONIVEL'::"public"."turmas_status_enum" WHEN 'encerrado' THEN 'ENCERRADO'::"public"."turmas_status_enum" ELSE "status"::"text"::"public"."turmas_status_enum" END`,
    );
    await queryRunner.query(`DROP TYPE "public"."turmas_status_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."cursos_temas_enum" RENAME TO "cursos_temas_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cursos_temas_enum" AS ENUM('INOVACAO', 'TECNOLOGIA', 'MARKETING', 'EMPREENDEDORISMO', 'AGRO')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cursos" ALTER COLUMN "temas" TYPE "public"."cursos_temas_enum"[] USING REPLACE(REPLACE(REPLACE(REPLACE(REPLACE("temas"::"text", 'Inovação', 'INOVACAO'), 'Tecnologia', 'TECNOLOGIA'), 'Marketing', 'MARKETING'), 'Empreendedorismo', 'EMPREENDEDORISMO'), 'Agro', 'AGRO')::"public"."cursos_temas_enum"[]`,
    );
    await queryRunner.query(`DROP TYPE "public"."cursos_temas_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."cursos_temas_enum_old" AS ENUM('Inovação', 'Tecnologia', 'Marketing', 'Empreendedorismo', 'Agro')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cursos" ALTER COLUMN "temas" TYPE "public"."cursos_temas_enum_old"[] USING REPLACE(REPLACE(REPLACE(REPLACE(REPLACE("temas"::"text", 'INOVACAO', 'Inovação'), 'TECNOLOGIA', 'Tecnologia'), 'MARKETING', 'Marketing'), 'EMPREENDEDORISMO', 'Empreendedorismo'), 'AGRO', 'Agro')::"public"."cursos_temas_enum_old"[]`,
    );
    await queryRunner.query(`DROP TYPE "public"."cursos_temas_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."cursos_temas_enum_old" RENAME TO "cursos_temas_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."turmas_status_enum_old" AS ENUM('disponível', 'encerrado')`,
    );
    await queryRunner.query(
      `ALTER TABLE "turmas" ALTER COLUMN "status" TYPE "public"."turmas_status_enum_old" USING CASE "status"::"text" WHEN 'DISPONIVEL' THEN 'disponível'::"public"."turmas_status_enum_old" WHEN 'ENCERRADO' THEN 'encerrado'::"public"."turmas_status_enum_old" ELSE "status"::"text"::"public"."turmas_status_enum_old" END`,
    );
    await queryRunner.query(`DROP TYPE "public"."turmas_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."turmas_status_enum_old" RENAME TO "turmas_status_enum"`,
    );
  }
}
