import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1779407686562 implements MigrationInterface {
  name = 'AutoMigration1779407686562';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cursos" ALTER COLUMN "temas" TYPE "public"."cursos_temas_enum"[] USING ARRAY["temas"]`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cursos" ALTER COLUMN "temas" TYPE "public"."cursos_temas_enum" USING "temas"[1]`,
    );
  }
}
